import { apiClient } from './client';
import type { ApiResponse } from '../types';

// Discount types
export interface Discount {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed_amount';
  value: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  sortOrder: number;
}

// Discounts API
const discountsApi = {
  // Get all active discounts
  getActiveDiscounts: async (): Promise<Discount[]> => {
    const response = await apiClient.get<ApiResponse<Discount[]>>('/discounts/active');
    return response.data.data;
  },

  // Get discount by ID
  getDiscount: async (id: string): Promise<Discount> => {
    const response = await apiClient.get<ApiResponse<Discount>>(`/discounts/${id}`);
    return response.data.data;
  },
};

export default discountsApi;
