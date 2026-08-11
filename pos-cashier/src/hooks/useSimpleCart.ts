import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setCurrentOrder, clearCurrentOrder } from '../store/slices/posSlice';
import orderItemsApi, { type CreateOrderItemPayload } from '../api/order-items';
import ordersApi, { type CreateOrderPayload } from '../api/orders';

// Hook: Get current order from backend
export function useOrderWithItems(orderId: string | null) {
  return useQuery({
    queryKey: ['orders', orderId, 'with-items'],
    queryFn: () => orderItemsApi.getOrderWithItems(orderId!),
    enabled: !!orderId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

// Hook: Get order calculation
export function useOrderCalculation(orderId: string | null) {
  return useQuery({
    queryKey: ['orders', orderId, 'calculation'],
    queryFn: () => ordersApi.getCalculation(orderId!),
    enabled: !!orderId,
    staleTime: 0,
  });
}

// Simple cart hook - no sync, no optimistic UI
// Everything comes from backend
export function useSimpleCart() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const posState = useSelector((state: RootState) => state.pos);

  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get order data
  const { data: orderData, isLoading: orderLoading, refetch: refetchOrder } = useOrderWithItems(
    posState.currentOrder?.id || null
  );

  // Get calculation data
  const { data: calculation, isLoading: calcLoading, refetch: refetchCalculation } = useOrderCalculation(
    posState.currentOrder?.id || null
  );

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (payload: CreateOrderItemPayload) => {
      // Ensure order exists
      let orderId = posState.currentOrder?.id;
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

      // Add item to order
      return orderItemsApi.addOrderItem(orderId, payload);
    },
    onMutate: () => {
      setIsAdding(true);
      setError(null);
    },
    onSuccess: () => {
      // Invalidate to get fresh data from backend
      queryClient.invalidateQueries({ queryKey: ['orders', posState.currentOrder?.id, 'with-items'] });
      queryClient.invalidateQueries({ queryKey: ['orders', posState.currentOrder?.id, 'calculation'] });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
    onSettled: () => {
      setIsAdding(false);
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return orderItemsApi.updateOrderItem(posState.currentOrder!.id, itemId, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', posState.currentOrder?.id, 'with-items'] });
      queryClient.invalidateQueries({ queryKey: ['orders', posState.currentOrder?.id, 'calculation'] });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return orderItemsApi.removeOrderItem(posState.currentOrder!.id, itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', posState.currentOrder?.id, 'with-items'] });
      queryClient.invalidateQueries({ queryKey: ['orders', posState.currentOrder?.id, 'calculation'] });
    },
  });

  // Apply discount
  const applyDiscountMutation = useMutation({
    mutationFn: async (discountId: string) => {
      return ordersApi.applyDiscount(posState.currentOrder!.id, discountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', posState.currentOrder?.id, 'with-items'] });
      queryClient.invalidateQueries({ queryKey: ['orders', posState.currentOrder?.id, 'calculation'] });
    },
  });

  // Remove discount
  const removeDiscountMutation = useMutation({
    mutationFn: async () => {
      return ordersApi.removeDiscount(posState.currentOrder!.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', posState.currentOrder?.id, 'with-items'] });
      queryClient.invalidateQueries({ queryKey: ['orders', posState.currentOrder?.id, 'calculation'] });
    },
  });

  // Clear cart (reset state)
  const clearCart = useCallback(() => {
    dispatch(clearCurrentOrder());
    queryClient.removeQueries({ queryKey: ['orders'] });
  }, [dispatch, queryClient]);

  return {
    // Data from backend
    order: orderData?.order,
    items: orderData?.items || [],
    calculation: calculation || orderData?.order,
    isLoading: orderLoading || calcLoading,

    // Mutations
    addItem: addItemMutation.mutate,
    addItemAsync: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutate,
    updateItemAsync: updateItemMutation.mutateAsync,
    removeItem: removeItemMutation.mutate,
    removeItemAsync: removeItemMutation.mutateAsync,

    // Discount
    applyDiscount: applyDiscountMutation.mutate,
    removeDiscount: removeDiscountMutation.mutate,

    // State
    isAdding,
    isAddingItem: addItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isRemoving: removeItemMutation.isPending,
    error,

    // Helpers
    refetch: () => {
      refetchOrder();
      refetchCalculation();
    },
    clearCart,

    // Check if has order
    hasOrder: !!posState.currentOrder?.id,
    orderId: posState.currentOrder?.id,
  };
}
