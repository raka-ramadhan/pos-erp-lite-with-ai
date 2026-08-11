import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import orderItemsApi, {
  type CreateOrderItemPayload,
  type UpdateOrderItemPayload,
} from '../api/order-items';
import { removeFromSyncedCart } from '../store/slices/posSlice';
import { createDebouncedSave, createPersistedCart } from '../utils/cartPersistence';
import type { RootState } from '../store';

// Hook: Get order with items
export function useOrderWithItems(orderId: string | null) {
  return useQuery({
    queryKey: ['orders', orderId, 'with-items'],
    queryFn: () => orderItemsApi.getOrderWithItems(orderId!),
    enabled: !!orderId,
    staleTime: 30 * 1000,
  });
}

// Hook: Get order items only
export function useOrderItems(orderId: string | null) {
  return useQuery({
    queryKey: ['orders', orderId, 'items'],
    queryFn: () => orderItemsApi.getOrderItems(orderId!),
    enabled: !!orderId,
    staleTime: 10 * 1000,
  });
}

// Hook: Add item to order
export function useAddOrderItem(orderId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderItemPayload) =>
      orderItemsApi.addOrderItem(orderId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'with-items'] });
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'calculation'] });
    },
  });
}

// Hook: Update order item
export function useUpdateOrderItem(orderId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: UpdateOrderItemPayload;
    }) => {
      await orderItemsApi.updateOrderItem(orderId!, itemId, payload);
      return { serverItemId: itemId, payload };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'with-items'] });
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'calculation'] });
    },
  });
}

// Hook: Update order item notes
export function useUpdateOrderItemNotes(orderId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, notes }: { itemId: string; notes: string }) =>
      orderItemsApi.updateOrderItemNotes(orderId!, itemId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'with-items'] });
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'calculation'] });
    },
  });
}

// Hook: Remove order item
export function useRemoveOrderItem(orderId: string | null) {
  const dispatch = useDispatch();
  const posState = useSelector((state: RootState) => state.pos);
  const queryClient = useQueryClient();
  const debouncedSave = createDebouncedSave(300);

  return useMutation({
    mutationFn: async (itemId: string) => {
      const syncedItem = posState.syncedCartItems.find(item => item.serverId === itemId);
      await orderItemsApi.removeOrderItem(orderId!, itemId);
      return { serverItemId: itemId, tempId: syncedItem?.tempId };
    },
    onSuccess: (result) => {
      if (result.tempId) {
        dispatch(removeFromSyncedCart(result.tempId));
      }
      const persistedCart = createPersistedCart({
        sessionId: posState.sessionId,
        orderId: posState.currentOrder?.id || null,
        orderType: posState.orderType,
        selectedTableId: posState.selectedTable?.id || null,
        cartItems: posState.syncedCartItems.filter(item => item.tempId !== result.tempId),
      });
      debouncedSave(persistedCart);
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'with-items'] });
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'calculation'] });
    },
  });
}
