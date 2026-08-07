import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import orderItemsApi, {
  type CreateOrderItemPayload,
  type UpdateOrderItemPayload,
  type OrderWithItems,
} from '../api/order-items';

// Hook: Get order with items
export function useOrderWithItems(orderId: string | null) {
  return useQuery({
    queryKey: ['orders', orderId, 'with-items'],
    queryFn: () => orderItemsApi.getOrderWithItems(orderId!),
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds - mutations will invalidate
    // No refetchInterval - data is refreshed via mutations
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
      // Invalidate order items cache - must match useOrderWithItems queryKey
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'with-items'] });
      // Also invalidate calculation cache
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'calculation'] });
    },
  });
}

// Hook: Update order item
export function useUpdateOrderItem(orderId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: UpdateOrderItemPayload;
    }) => orderItemsApi.updateOrderItem(orderId!, itemId, payload),
    onSuccess: () => {
      // Invalidate order items cache - must match useOrderWithItems queryKey
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'with-items'] });
      // Also invalidate calculation cache
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
      // Invalidate order items cache - must match useOrderWithItems queryKey
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'with-items'] });
      // Also invalidate calculation cache
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'calculation'] });
    },
  });
}

// Hook: Remove order item
export function useRemoveOrderItem(orderId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      orderItemsApi.removeOrderItem(orderId!, itemId),
    onSuccess: () => {
      // Invalidate order items cache - must match useOrderWithItems queryKey
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'with-items'] });
      // Also invalidate calculation cache
      queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'calculation'] });
    },
  });
}
