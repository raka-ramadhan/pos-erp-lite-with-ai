import { apiClient } from './client';
import type { ApiResponse } from '../types';

// Order calculation types
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

// Order calculation API
const orderCalculationApi = {
  // Get order calculation preview
  getCalculation: async (orderId: string): Promise<OrderCalculation> => {
    const response = await apiClient.get<ApiResponse<OrderCalculation>>(
      `/orders/${orderId}/calculation`
    );
    return response.data.data;
  },

  // Apply discount to order
  applyDiscount: async (orderId: string, discountId: string | null): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/orders/${orderId}/discount`,
      { discountId }
    );
    return response.data.data;
  },

  // Remove discount from order
  removeDiscount: async (orderId: string): Promise<any> => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/orders/${orderId}/discount`
    );
    return response.data.data;
  },
};

export default orderCalculationApi;
