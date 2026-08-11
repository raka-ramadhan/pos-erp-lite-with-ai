import { apiClient } from './client';
import type { ApiResponse } from '../types';

// Payment types
export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  paymentType: 'cash' | 'card' | 'qris' | 'ewallet';
  provider: string | null;
  isIntegration: boolean;
  iconUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface CreatePaymentPayload {
  orderId: string;
  paymentMethodId: string;
  amount: number;
  changeAmount: number;
  referenceNumber?: string;
  cardNumber?: string;
  cardHolder?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  paymentMethodId: string;
  paymentMethodName: string;
  paymentType: string;
  amount: number;
  totalAmount: number;
  changeAmount: number;
  referenceNumber: string | null;
  cardNumber: string | null;
  cardHolder: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

export interface PaymentResult {
  id: string;
  orderId: string;
  orderNumber: string;
  paymentMethodId: string;
  paymentMethodName: string;
  paymentType: string;
  amount: number;
  totalAmount: number;
  changeAmount: number;
  referenceNumber: string | null;
  cardNumber: string | null;
  cardHolder: string | null;
  status: string;
  createdAt: string;
}

// Payment API
const paymentsApi = {
  // Get active payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get<ApiResponse<PaymentMethod[]>>('/payment-methods/active');
    return response.data.data;
  },

  // Create payment
  createPayment: async (payload: CreatePaymentPayload): Promise<PaymentResult> => {
    const response = await apiClient.post<ApiResponse<PaymentResult>>('/payments', payload);
    return response.data.data;
  },

  // Get payment by ID
  getPayment: async (id: string): Promise<Payment> => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  },

  // Get payments for an order
  getPaymentsByOrder: async (orderId: string): Promise<Payment[]> => {
    const response = await apiClient.get<ApiResponse<Payment[]>>(`/payments/order/${orderId}`);
    return response.data.data;
  },

  // Check if order is paid
  isOrderPaid: async (orderId: string): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<boolean>>(`/payments/order/${orderId}/status`);
    return response.data.data;
  },
};

export default paymentsApi;
