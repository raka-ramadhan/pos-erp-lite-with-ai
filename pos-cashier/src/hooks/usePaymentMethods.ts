import { useQuery } from '@tanstack/react-query';
import paymentsApi from '../api/payments';

// Hook: Get active payment methods
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods', 'active'],
    queryFn: paymentsApi.getPaymentMethods,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook: Check if order is paid
export function useIsOrderPaid(orderId: string | null) {
  return useQuery({
    queryKey: ['payments', 'order', orderId, 'status'],
    queryFn: () => paymentsApi.isOrderPaid(orderId!),
    enabled: !!orderId,
  });
}
