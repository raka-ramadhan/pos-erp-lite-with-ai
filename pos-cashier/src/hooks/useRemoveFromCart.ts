import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RootState } from '../store';
import {
  removeFromSyncedCart,
  updateItemSyncStatus,
  setSyncStatus,
} from '../store/slices/posSlice';
import { createDebouncedSave, createPersistedCart } from '../utils/cartPersistence';
import orderItemsApi from '../api/order-items';

interface RemoveFromCartParams {
  tempId: string;
  serverId?: string;
}

interface UseRemoveFromCartOptions {
  onSuccess?: (result: unknown, tempId: string) => void;
  onError?: (error: Error, tempId: string) => void;
}

/**
 * Optimistic remove from cart hook
 * 1. Remove from Redux IMMEDIATELY (optimistic)
 * 2. Save to localStorage
 * 3. Delete from server in background
 */
export function useRemoveFromCart(options?: UseRemoveFromCartOptions) {
  const dispatch = useDispatch();
  const posState = useSelector((state: RootState) => state.pos);
  const queryClient = useQueryClient();

  const debouncedSave = createDebouncedSave(300);

  return useMutation({
    mutationFn: async (params: RemoveFromCartParams) => {
      const { tempId, serverId } = params;

      // If no serverId, just remove locally
      if (!serverId || !posState.currentOrder?.id) {
        return { success: true, tempId };
      }

      // Delete from server
      await orderItemsApi.removeOrderItem(posState.currentOrder.id, serverId);

      return { success: true, tempId };
    },

    onMutate: async (params) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['orders', posState.currentOrder?.id, 'with-items'],
      });

      // Get current items BEFORE removing
      const currentItems = posState.syncedCartItems;

      // Remove from Redux IMMEDIATELY (optimistic)
      dispatch(removeFromSyncedCart(params.tempId));

      // Update sync status
      dispatch(setSyncStatus('syncing'));

      // Calculate updated items (what the state will look like after removal)
      const updatedItems = currentItems.filter(item => item.tempId !== params.tempId);

      // Save to localStorage (debounced) with updated items
      const persistedCart = createPersistedCart({
        sessionId: posState.sessionId,
        orderId: posState.currentOrder?.id || null,
        orderType: posState.orderType,
        selectedTableId: posState.selectedTable?.id || null,
        cartItems: updatedItems,
      });
      debouncedSave(persistedCart);

      return { tempId: params.tempId };
    },

    onSuccess: (result, params) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ['orders', posState.currentOrder?.id, 'with-items'],
      });
      queryClient.invalidateQueries({
        queryKey: ['orders', posState.currentOrder?.id, 'calculation'],
      });

      dispatch(setSyncStatus('synced'));

      options?.onSuccess?.(result, params.tempId);
    },

    onError: (error, params) => {
      console.error('Failed to remove from cart:', error);

      // Note: Item is already removed from Redux, so we can't mark it as failed
      // The item is effectively deleted locally
      // In a more robust implementation, we would restore it and mark as failed

      dispatch(setSyncStatus('failed'));

      options?.onError?.(error as Error, params.tempId);
    },
  });
}
