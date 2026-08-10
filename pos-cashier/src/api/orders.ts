import { apiClient } from './client';
import type { ApiResponse } from '../types';

export interface CreateOrderPayload {
  orderType: 'dine_in' | 'take_away' | 'delivery';
  tableId?: string;
  customerId?: string;
  customerCount?: number;
  notes?: string;
  internalNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: 'dine_in' | 'take_away' | 'delivery';
  orderStatus: 'open' | 'in_progress' | 'completed' | 'cancelled';
  tableId: string | null;
  table: {
    id: string;
    tableCode: string;
    tableName: string;
  } | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  customerCount: number;
  notes: string | null;
  orderedAt: string;
  createdAt: string;
}

const ordersApi = {
  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', payload);
    return response.data.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },

  getByOrderNumber: async (orderNumber: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/number/${orderNumber}`);
    return response.data.data;
  },

  updateStatus: async (
    id: string,
    status: string,
    cancelledReason?: string
  ): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, {
      orderStatus: status,
      cancelledReason,
    });
    return response.data.data;
  },

  cancel: async (id: string, reason?: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/orders/${id}/cancel`,
      { data: { reason } }
    );
    return response.data.data;
  },
};

export default ordersApi;
