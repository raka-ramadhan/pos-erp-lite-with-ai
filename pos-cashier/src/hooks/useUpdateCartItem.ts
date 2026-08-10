import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RootState } from '../store';
import {
  updateSyncedCartItem,
  updateItemSyncStatus,
  setSyncStatus,
} from '../store/slices/posSlice';
import { createDebouncedSave, createPersistedCart } from '../utils/cartPersistence';
import orderItemsApi from '../api/order-items';

interface UpdateCartItemParams {
  tempId: string;
  serverId?: string;
  quantity: number;
  notes?: string;
}

interface UseUpdateCartItemOptions {
  onSuccess?: (result: unknown, params: UpdateCartItemParams) => void;
  onError?: (error: Error, params: UpdateCartItemParams) => void;
}

/**
 * Optimistic update cart item hook
 * 1. Update Redux immediately (optimistic)
 * 2. Save to localStorage
 * 3. Sync to server in background
 */
export function useUpdateCartItem(options?: UseUpdateCartItemOptions) {
  const dispatch = useDispatch();
  const posState = useSelector((state: RootState) => state.pos);
  const queryClient = useQueryClient();

  const debouncedSave = createDebouncedSave(300);

  return useMutation({
    mutationFn: async (params: UpdateCartItemParams) => {
      const { tempId, serverId, quantity, notes } = params;

      // If no serverId, we can't sync to server yet
      // This happens for items that haven't been synced
      if (!serverId || !posState.currentOrder?.id) {
        return { success: true, tempId };
      }

      // Update on server
      const result = await orderItemsApi.updateOrderItem(
        posState.currentOrder.id,
        serverId,
        {
          quantity,
          notes,
        }
      );

      return { success: true, result, tempId };
    },

    onMutate: async (params) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['orders', posState.currentOrder?.id, 'with-items'],
      });

      // Update Redux IMMEDIATELY (optimistic)
      dispatch(updateSyncedCartItem({
        tempId: params.tempId,
        quantity: params.quantity,
        notes: params.notes,
      }));

      // Update sync status
      dispatch(setSyncStatus('syncing'));

      // Save to localStorage (debounced)
      const persistedCart = createPersistedCart({
        sessionId: posState.sessionId,
        orderId: posState.currentOrder?.id || null,
        orderType: posState.orderType,
        selectedTableId: posState.selectedTable?.id || null,
        cartItems: posState.syncedCartItems,
      });
      debouncedSave(persistedCart);

      return { tempId: params.tempId };
    },

    onSuccess: (result, params) => {
      // Update item sync status
      dispatch(updateItemSyncStatus({
        tempId: params.tempId,
        status: 'synced',
      }));

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ['orders', posState.currentOrder?.id, 'with-items'],
      });
      queryClient.invalidateQueries({
        queryKey: ['orders', posState.currentOrder?.id, 'calculation'],
      });

      dispatch(setSyncStatus('synced'));

      options?.onSuccess?.(result, params);
    },

    onError: (error, params) => {
      console.error('Failed to update cart item:', error);

      // Mark item as failed
      dispatch(updateItemSyncStatus({
        tempId: params.tempId,
        status: 'failed',
        error: error.message,
      }));

      dispatch(setSyncStatus('failed'));

      options?.onError?.(error as Error, params);
    },
  });
}
