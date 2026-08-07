import { apiClient } from './client';
import type { ApiResponse } from '../types';

// Order Item types
export interface OrderItemModifier {
  id: string;
  orderItemId: string;
  modifierId: string;
  modifierName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string | null;  // Added from backend
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes: string | null;
  sortOrder: number;
  modifiers: OrderItemModifier[];
  createdAt: string;
  updatedAt: string;
}

// Modifier payload for creating order items
export interface OrderItemModifierPayload {
  modifierId: string;
  modifierName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderItemPayload {
  productId: string;
  quantity: number;
  unitPrice: number;
  variantName?: string;
  notes?: string;
  modifiers?: OrderItemModifierPayload[];
}

export interface UpdateOrderItemPayload {
  quantity?: number;
  variantName?: string;
  notes?: string;
}

// Order with Items response
export interface OrderWithItems {
  order: {
    id: string;
    orderNumber: string;
    orderType: string;
    orderStatus: string;
    tableId: string | null;
    table: { id: string; tableCode: string; tableName: string; areaName: string | null } | null;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    customerCount: number;
    notes: string | null;
    orderedAt: string;
    createdAt: string;
  };
  items: OrderItem[];
}

// Order Calculation response
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

// Order Items API
const orderItemsApi = {
  // Get all items for an order
  getOrderItems: async (orderId: string): Promise<OrderItem[]> => {
    const response = await apiClient.get<ApiResponse<OrderItem[]>>(
      `/orders/${orderId}/items`
    );
    return response.data.data;
  },

  // Get order with items
  getOrderWithItems: async (orderId: string): Promise<OrderWithItems> => {
    const response = await apiClient.get<ApiResponse<OrderWithItems>>(
      `/orders/${orderId}/with-items`
    );
    return response.data.data;
  },

  // Add item to order
  addOrderItem: async (
    orderId: string,
    payload: CreateOrderItemPayload
  ): Promise<OrderItem> => {
    const response = await apiClient.post<ApiResponse<OrderItem>>(
      `/orders/${orderId}/items`,
      payload
    );
    return response.data.data;
  },

  // Update order item
  updateOrderItem: async (
    orderId: string,
    itemId: string,
    payload: UpdateOrderItemPayload
  ): Promise<OrderItem> => {
    const response = await apiClient.patch<ApiResponse<OrderItem>>(
      `/orders/${orderId}/items/${itemId}`,
      payload
    );
    return response.data.data;
  },

  // Update order item notes
  updateOrderItemNotes: async (
    orderId: string,
    itemId: string,
    notes: string
  ): Promise<OrderItem> => {
    const response = await apiClient.patch<ApiResponse<OrderItem>>(
      `/orders/${orderId}/items/${itemId}/notes`,
      { notes }
    );
    return response.data.data;
  },

  // Remove item from order
  removeOrderItem: async (
    orderId: string,
    itemId: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/orders/${orderId}/items/${itemId}`
    );
    return response.data.data;
  },
};

export default orderItemsApi;
