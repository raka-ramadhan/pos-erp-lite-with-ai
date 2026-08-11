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
import { createDebouncedSave, createPersistedCart, areModifiersEqual, generateTempId } from '../utils/cartPersistence';
import orderItemsApi, { type CreateOrderItemPayload } from '../api/order-items';
import ordersApi, { type CreateOrderPayload } from '../api/orders';
import { store } from '../store';

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
  tempId: string;           // For tracking which Redux item to update
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

// Debounce delay for batching rapid clicks on SAME product
const SYNC_DELAY_MS = 200;

/**
 * Optimistic add to cart hook
 * - Rapid clicks on SAME product are debounced and batched
 * - Different products sync immediately
 */
export function useAddToCart(options?: UseAddToCartOptions) {
  const dispatch = useDispatch();
  const posState = useSelector((state: RootState) => state.pos);
  const queryClient = useQueryClient();

  const debouncedSave = createDebouncedSave(200);
  const pendingAddsRef = useRef<Map<string, PendingAdd>>(new Map());
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flush pending adds to server - SEQUENTIAL to avoid race conditions
  const flushPendingAdds = useCallback(async () => {
    // Get items from pending, then CLEAR immediately
    const items = Array.from(pendingAddsRef.current.values());
    if (items.length === 0) return;

    // Clear pending BEFORE processing to prevent duplicates
    pendingAddsRef.current.clear();

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }

    // Process items SEQUENTIALLY to avoid race conditions
    let orderId = posState.currentOrder?.id;

    for (const item of items) {
      try {
        // Create order if needed (only once, at the start)
        if (!orderId) {
          const orderPayload: CreateOrderPayload = {
            orderType: posState.orderType === 'dine_in_with_table' ? 'dine_in' :
                       posState.orderType === 'takeaway' ? 'take_away' : 'dine_in',
            tableId: posState.selectedTable?.id,
            customerCount: 1,
          };

          const newOrder = await ordersApi.create(orderPayload);
          orderId = newOrder.id;
          dispatch(setCurrentOrder(newOrder));
        }

        const apiModifiers = item.modifiers.length > 0
          ? item.modifiers.map((mod) => ({
              modifierId: mod.id,
              modifierName: mod.name,
              quantity: 1,
              unitPrice: mod.additionalPrice,
            }))
          : undefined;

        const itemPayload: CreateOrderItemPayload = {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.basePrice,
          variantName: item.variantName,
          notes: item.notes,
          modifiers: apiModifiers,
        };

        const savedItem = await orderItemsApi.addOrderItem(orderId, itemPayload);

        // Update individual item's sync status to 'synced' and store serverId
        dispatch(updateItemSyncStatus({
          tempId: item.tempId,
          status: 'synced',
          serverId: savedItem.id,
        }));

        // Invalidate queries
        queryClient.invalidateQueries({
          queryKey: ['orders', orderId, 'with-items'],
        });
        queryClient.invalidateQueries({
          queryKey: ['orders', orderId, 'calculation'],
        });

        item.resolve(savedItem);
        options?.onSuccess?.(savedItem, item);
      } catch (error) {
        console.error('Failed to sync to server:', error);
        item.reject(error as Error);
        options?.onError?.(error as Error, item);
      }
    }

    // Set sync status based on results
    dispatch(setSyncStatus('synced'));
  }, [dispatch, posState.currentOrder, posState.orderType, posState.selectedTable, queryClient, options]);

  return useMutation({
    mutationFn: async (params: AddToCartParams, context): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        const key = `${params.productId}-${params.variantName || 'no-variant'}-${JSON.stringify(params.modifiers.map(m => m.id).sort())}`;

        // Use tempId from context (set by onMutate), fallback to finding it from Redux
        let tempId = context?.tempId;

        if (!tempId) {
          // Find the tempId from current Redux state
          const state = store.getState();
          const foundItem = state.pos.syncedCartItems.find((item) =>
            item.productId === params.productId &&
            item.variantName === params.variantName &&
            areModifiersEqual(item.modifiers, params.modifiers)
          );
          tempId = foundItem?.tempId || generateTempId();
        }

        const existing = pendingAddsRef.current.get(key);
        if (existing) {
          // Same product+modifiers - accumulate quantity, extend debounce
          existing.quantity += params.quantity;
          existing.resolve = resolve;
          existing.reject = reject;
        } else {
          pendingAddsRef.current.set(key, {
            tempId,
            productId: params.productId,
            productName: params.productName,
            basePrice: params.basePrice,
            quantity: params.quantity,
            modifiers: params.modifiers,
            notes: params.notes,
            variantName: params.variantName,
            resolve,
            reject,
          });
        }

        // Different product - sync immediately (no debounce)
        if (pendingAddsRef.current.size === 1) {
          // First item - start debounce timer
          syncTimeoutRef.current = setTimeout(flushPendingAdds, SYNC_DELAY_MS);
        } else if (pendingAddsRef.current.size > 1) {
          // More than one product pending - flush immediately
          // (don't wait for debounce for different products)
          if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = null;
          }
          flushPendingAdds();
        }
      });
    },

    onMutate: async (params) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['orders', posState.currentOrder?.id, 'with-items'],
      });

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

        dispatch(setSyncStatus('syncing'));

        const persistedCart = createPersistedCart({
          sessionId: posState.sessionId,
          orderId: posState.currentOrder?.id || null,
          orderType: posState.orderType,
          selectedTableId: posState.selectedTable?.id || null,
          cartItems: posState.syncedCartItems,
        });
        debouncedSave(persistedCart);

        // Return tempId from existing item for mutationFn to use
        return {
          tempId: existingItem.tempId,
          productId: params.productId,
          quantity: params.quantity,
          isUpdate: true,
        };
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

        // IMMEDIATELY read the new state to get the tempId generated by Redux
        const stateAfterDispatch = queryClient.getQueryData<RootState>(['redux', 'pos']);
        const newItem = stateAfterDispatch?.pos?.syncedCartItems?.find(
          (item) => item.productId === params.productId &&
                   item.variantName === params.variantName &&
                   areModifiersEqual(item.modifiers, params.modifiers)
        );

        dispatch(setSyncStatus('syncing'));

        const persistedCart = createPersistedCart({
          sessionId: posState.sessionId,
          orderId: posState.currentOrder?.id || null,
          orderType: posState.orderType,
          selectedTableId: posState.selectedTable?.id || null,
          cartItems: posState.syncedCartItems,
        });
        debouncedSave(persistedCart);

        // Return tempId from the newly added item for mutationFn to use
        return {
          tempId: newItem?.tempId || generateTempId(),
          productId: params.productId,
          quantity: params.quantity,
          isUpdate: false,
        };
      }
    },

    onSuccess: () => {
      // Optimistic update done
    },

    onError: (error, params) => {
      const key = `${params.productId}-${params.variantName || 'no-variant'}-${JSON.stringify(params.modifiers.map(m => m.id).sort())}`;
      pendingAddsRef.current.delete(key);

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
