import apiClient from './client';
import type { ApiResponse } from '../types';

export type DiscountType = 'percentage' | 'fixed_amount';

export interface Discount {
  id: string;
  outletId: string;
  code: string | null;
  name: string;
  description: string | null;
  discountType: DiscountType;
  value: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  sortOrder: number;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueryDiscountParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'sortOrder' | 'name' | 'code' | 'value' | 'createdAt';
  order?: 'ASC' | 'DESC';
  discountType?: DiscountType;
  status?: 'active' | 'inactive' | 'all';
}

export interface PaginatedDiscountResponse {
  data: Discount[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateDiscountDto {
  code?: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startDate?: string;
  endDate?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateDiscountDto {
  code?: string;
  name?: string;
  description?: string;
  discountType?: DiscountType;
  value?: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startDate?: string;
  endDate?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// Discount type display options
export const DISCOUNT_TYPE_OPTIONS: Record<DiscountType, { label: string; icon: string }> = {
  percentage: { label: 'Percentage', icon: '📊' },
  fixed_amount: { label: 'Fixed Amount', icon: '💰' },
};

export default {
  getAll: async (params: QueryDiscountParams = {}): Promise<PaginatedDiscountResponse> => {
    const response = await apiClient.get('/discounts', { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  },

  getAllActive: async (): Promise<Discount[]> => {
    const response = await apiClient.get('/discounts/active');
    return response.data.data || [];
  },

  getOne: async (id: string): Promise<Discount> => {
    const response = await apiClient.get<ApiResponse<Discount>>(`/discounts/${id}`);
    return response.data.data;
  },

  create: async (data: CreateDiscountDto): Promise<Discount> => {
    const response = await apiClient.post<ApiResponse<Discount>>('/discounts', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateDiscountDto): Promise<Discount> => {
    const response = await apiClient.patch<ApiResponse<Discount>>(`/discounts/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/discounts/${id}`);
    return response.data.data;
  },

  restore: async (id: string): Promise<Discount> => {
    const response = await apiClient.post<ApiResponse<Discount>>(`/discounts/${id}/restore`);
    return response.data.data;
  },
};
