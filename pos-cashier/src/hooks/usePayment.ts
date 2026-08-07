import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { PaymentMethod, ApiResponse } from '../types';

// Payment API functions
const paymentApi = {
  // Get active payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get<ApiResponse<PaymentMethod[]>>('/payment-methods/active');
    return response.data.data;
  },
};

// Hook: Get payment methods
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods', 'active'],
    queryFn: paymentApi.getPaymentMethods,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook: Prefetch payment data
export function usePrefetchPaymentData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ['payment-methods', 'active'],
          queryFn: paymentApi.getPaymentMethods,
        }),
      ]);
    },
  });
}
