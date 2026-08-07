import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taxesApi from '../api/taxes';
import discountsApi from '../api/discounts';
import orderCalculationApi, { type OrderCalculation } from '../api/order-calculation';

// Hook: Get active taxes
export function useTaxes() {
  return useQuery({
    queryKey: ['taxes', 'active'],
    queryFn: taxesApi.getActiveTaxes,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook: Get active discounts
export function useDiscounts() {
  return useQuery({
    queryKey: ['discounts', 'active'],
    queryFn: discountsApi.getActiveDiscounts,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook: Get order calculation
export function useOrderCalculation(orderId: string | null) {
  return useQuery({
    queryKey: ['orders', orderId, 'calculation'],
    queryFn: () => orderCalculationApi.getCalculation(orderId!),
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds - calculation doesn't change frequently
    // No refetchInterval - only fetch when data changes via mutations
  });
}

// Hook: Apply discount to order
export function useApplyDiscount(orderId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (discountId: string | null) =>
      orderCalculationApi.applyDiscount(orderId!, discountId),
    onSuccess: () => {
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'calculation'] });
        queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'with-items'] });
        queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      }
    },
  });
}

// Hook: Remove discount from order
export function useRemoveDiscount(orderId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => orderCalculationApi.removeDiscount(orderId!),
    onSuccess: () => {
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'calculation'] });
        queryClient.invalidateQueries({ queryKey: ['orders', orderId, 'with-items'] });
        queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      }
    },
  });
}
