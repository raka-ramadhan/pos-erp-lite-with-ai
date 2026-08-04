import apiClient from './client';
import type { ApiResponse } from '../types';

export interface Tax {
  id: string;
  outletId: string | null;
  code: string;
  name: string;
  description: string | null;
  taxType: 'percentage' | 'fixed_amount';
  rate: number;
  isDefault: boolean;
  calculationBase: string;
  calculationOrder: number;
  isInclusive: boolean;
  sortOrder: number;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueryTaxParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'name' | 'code' | 'rate' | 'taxType' | 'calculationOrder' | 'createdAt';
  order?: 'ASC' | 'DESC';
  taxType?: 'percentage' | 'fixed_amount';
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'all';
}

export interface PaginatedTaxResponse {
  data: Tax[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTaxDto {
  code: string;
  name: string;
  description?: string;
  taxType: 'percentage' | 'fixed_amount';
  rate: number;
  isDefault?: boolean;
  calculationBase?: 'subtotal' | 'after_discount';
  calculationOrder?: number;
  isInclusive?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateTaxDto {
  code?: string;
  name?: string;
  description?: string;
  taxType?: 'percentage' | 'fixed_amount';
  rate?: number;
  isDefault?: boolean;
  calculationBase?: 'subtotal' | 'after_discount';
  calculationOrder?: number;
  isInclusive?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export default {
  getAll: async (params: QueryTaxParams = {}): Promise<PaginatedTaxResponse> => {
    const response = await apiClient.get('/taxes', { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  },

  getAllActive: async (): Promise<Tax[]> => {
    const response = await apiClient.get('/taxes/active');
    return response.data.data || [];
  },

  getOne: async (id: string): Promise<Tax> => {
    const response = await apiClient.get<ApiResponse<Tax>>(`/taxes/${id}`);
    return response.data.data;
  },

  create: async (data: CreateTaxDto): Promise<Tax> => {
    const response = await apiClient.post<ApiResponse<Tax>>('/taxes', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateTaxDto): Promise<Tax> => {
    const response = await apiClient.patch<ApiResponse<Tax>>(`/taxes/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/taxes/${id}`);
    return response.data.data;
  },

  restore: async (id: string): Promise<Tax> => {
    const response = await apiClient.post<ApiResponse<Tax>>(`/taxes/${id}/restore`);
    return response.data.data;
  },
};
