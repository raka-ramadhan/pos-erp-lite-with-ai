import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RootState } from '../store';
import type { SelectedModifier } from '../types';
import {
  addToSyncedCart,
  updateSyncedCartItem,
  updateItemSyncStatus,
  setSyncStatus,
  setCurrentOrder,
} from '../store/slices/posSlice';
import { createDebouncedSave, createPersistedCart, areModifiersEqual } from '../utils/cartPersistence';
import orderItemsApi, { type CreateOrderItemPayload } from '../api/order-items';
import ordersApi, { type CreateOrderPayload } from '../api/orders';
import type { Order } from '../api/orders';

interface AddToCartParams {
  productId: string;
  productName: string;
  basePrice: number;
  quantity: number;
  modifiers: SelectedModifier[];
  notes?: string;
  variantName?: string;
}

interface UseAddToCartOptions {
  onSuccess?: (serverItem: unknown, item: AddToCartParams) => void;
  onError?: (error: Error, item: AddToCartParams) => void;
}

interface PendingAdd {
  productId: string;
  productName: string;
  basePrice: number;
  quantity: number;
  modifiers: SelectedModifier[];
  notes?: string;
  variantName?: string;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

// Debounce delay for batching rapid clicks
const SYNC_DELAY_MS = 300;

/**
 * Optimistic add to cart hook with debounced batching
 * - Rapid clicks are batched into single request
 * - Quantity is accumulated before sending to backend
 */
export function useAddToCart(options?: UseAddToCartOptions) {
  const dispatch = useDispatch();
  const posState = useSelector((state: RootState) => state.pos);
  const queryClient = useQueryClient();

  const debouncedSave = createDebouncedSave(300);
  const pendingAddsRef = useRef<Map<string, PendingAdd>>(new Map());
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Internal mutation for server sync
  const syncMutation = useMutation({
    mutationFn: async (params: {
      productId: string;
      productName: string;
      basePrice: number;
      quantity: number;
      modifiers: SelectedModifier[];
      notes?: string;
      variantName?: string;
    }) => {
      const { productId, productName, basePrice, quantity, modifiers, notes, variantName } = params;

      // Check if we need to create an order first
      let orderId = posState.currentOrder?.id;

      if (!orderId) {
        // Create new order first
        const orderPayload: CreateOrderPayload = {
          orderType: posState.orderType === 'dine_in_with_table' ? 'dine_in' :
                     posState.orderType === 'takeaway' ? 'take_away' : 'dine_in',
          tableId: posState.selectedTable?.id,
          customerCount: 1,
        };

        const newOrder = await ordersApi.create(orderPayload);
        orderId = newOrder.id;

        // Update Redux with new order
        dispatch(setCurrentOrder(newOrder));
      }

      // Prepare modifiers for API
      const apiModifiers = modifiers.length > 0
        ? modifiers.map((mod) => ({
            modifierId: mod.id,
            modifierName: mod.name,
            quantity: 1,
            unitPrice: mod.additionalPrice,
          }))
        : undefined;

      // Create order item payload
      const itemPayload: CreateOrderItemPayload = {
        productId,
        quantity,
        unitPrice: basePrice,
        variantName,
        notes,
        modifiers: apiModifiers,
      };

      // Call server API
      const serverItem = await orderItemsApi.addOrderItem(orderId, itemPayload);

      return { serverItem, tempId: null };
    },
    onSuccess: (result, params) => {
      // Invalidate queries to sync with server
      queryClient.invalidateQueries({
        queryKey: ['orders', posState.currentOrder?.id, 'with-items'],
      });
      queryClient.invalidateQueries({
        queryKey: ['orders', posState.currentOrder?.id, 'calculation'],
      });

      dispatch(setSyncStatus('synced'));
    },
    onError: (error, params) => {
      console.error('Failed to sync to server:', error);
      dispatch(setSyncStatus('failed'));
    },
  });

  // Flush all pending adds to server
  const flushPendingAdds = useCallback(() => {
    const pending = pendingAddsRef.current;
    if (pending.size === 0) return;

    // Get all pending adds and clear
    const items = Array.from(pending.values());
    pending.clear();

    // Cancel timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }

    // Send each unique product+modifiers combo
    items.forEach((item) => {
      syncMutation.mutate(item, {
        onSuccess: (result) => options?.onSuccess?.(result, item),
        onError: (error) => options?.onError?.(error, item),
      });
    });
  }, [syncMutation, options]);

  return useMutation({
    mutationFn: async (params: AddToCartParams): Promise<unknown> => {
      // This is called optimistically, actual sync happens in onMutate
      // Return a promise that resolves when sync completes
      return new Promise((resolve, reject) => {
        // Queue the add
        const key = `${params.productId}-${params.variantName || 'no-variant'}-${JSON.stringify(params.modifiers.map(m => m.id).sort())}`;

        const existing = pendingAddsRef.current.get(key);
        if (existing) {
          // Accumulate quantity for same product
          existing.quantity += params.quantity;
          existing.resolve = resolve;
          existing.reject = reject;
        } else {
          pendingAddsRef.current.set(key, {
            ...params,
            resolve,
            reject,
          });
        }

        // Schedule sync
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(flushPendingAdds, SYNC_DELAY_MS);
      });
    },

    onMutate: async (params) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['orders', posState.currentOrder?.id, 'with-items'],
      });

      // Get current cart state
      const currentItems = posState.syncedCartItems;

      // Find existing item with same productId, variantName, and modifiers
      const existingItem = currentItems.find((item) => {
        if (item.productId !== params.productId) return false;
        if (item.variantName !== params.variantName) return false;
        return areModifiersEqual(item.modifiers, params.modifiers);
      });

      if (existingItem) {
        // Update existing item's quantity (optimistic)
        const newQuantity = existingItem.quantity + params.quantity;
        dispatch(updateSyncedCartItem({
          tempId: existingItem.tempId,
          quantity: newQuantity,
        }));
      } else {
        // Add new item (optimistic)
        dispatch(addToSyncedCart({
          productId: params.productId,
          productName: params.productName,
          basePrice: params.basePrice,
          quantity: params.quantity,
          modifiers: params.modifiers,
          notes: params.notes,
          variantName: params.variantName,
        }));
      }

      // Update sync status
      dispatch(setSyncStatus('syncing'));

      // Save to localStorage (debounced) with updated items
      const persistedCart = createPersistedCart({
        sessionId: posState.sessionId,
        orderId: posState.currentOrder?.id || null,
        orderType: posState.orderType,
        selectedTableId: posState.selectedTable?.id || null,
        cartItems: posState.syncedCartItems,
      });
      debouncedSave(persistedCart);

      return {
        tempId: existingItem?.tempId,
        productId: params.productId,
        quantity: params.quantity,
        isUpdate: !!existingItem,
      };
    },

    onSuccess: () => {
      // Optimistic update done, actual sync is happening via flushPendingAdds
    },

    onError: (error, params) => {
      // Cancel pending sync for this item
      const key = `${params.productId}-${params.variantName || 'no-variant'}-${JSON.stringify(params.modifiers.map(m => m.id).sort())}`;
      pendingAddsRef.current.delete(key);

      // Mark as failed in Redux
      const currentItems = posState.syncedCartItems;
      const addedItem = currentItems.find(
        (item) => item.productId === params.productId && item.syncStatus === 'pending'
      );

      if (addedItem) {
        dispatch(updateItemSyncStatus({
          tempId: addedItem.tempId,
          status: 'failed',
          error: error.message,
        }));
      }

      dispatch(setSyncStatus('failed'));
      options?.onError?.(error as Error, params);
    },
  });
}
