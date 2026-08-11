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

export interface OrderCalculation {
  subtotal: number;
  productDiscountTotal: number;
  subtotalAfterProductDiscount: number;
  orderDiscountAmount: number;
  subtotalAfterDiscount: number;
  serviceChargeAmount: number;
  taxAmount: number;
  totalAmount: number;
  appliedDiscountId: string | null;
  appliedDiscountName: string | null;
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

  cancelOrder: async (orderId: string, reason: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/orders/${orderId}/cancel`,
      { data: { reason } }
    );
    return response.data.data;
  },

  getCalculation: async (orderId: string): Promise<OrderCalculation> => {
    const response = await apiClient.get<ApiResponse<OrderCalculation>>(
      `/orders/${orderId}/calculation`
    );
    return response.data.data;
  },

  applyDiscount: async (orderId: string, discountId: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/orders/${orderId}/discount`,
      { discountId }
    );
    return response.data.data;
  },

  removeDiscount: async (orderId: string): Promise<Order> => {
    const response = await apiClient.delete<ApiResponse<Order>>(
      `/orders/${orderId}/discount`
    );
    return response.data.data;
  },

  // Create order with table assignment atomically
  createOrderWithTable: async (payload: CreateOrderPayload): Promise<Order> => {
    // First create the order
    const order = await apiClient.post<ApiResponse<Order>>('/orders', payload);

    // Then assign the table using the dedicated endpoint
    const orderWithTable = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${order.data.data.id}/assign-table`,
      { tableId: payload.tableId }
    );

    return orderWithTable.data.data;
  },
};

export default ordersApi;
