import { useMutation } from '@tanstack/react-query';
import paymentsApi, { CreatePaymentPayload, PaymentResult } from '../api/payments';

// Hook: Process payment
export function useProcessPayment() {
  return useMutation({
    mutationFn: async (payload: CreatePaymentPayload): Promise<PaymentResult> => {
      return paymentsApi.createPayment(payload);
    },
  });
}
