import apiClient from './client';
import type { ApiResponse } from '../types';

export interface ModifierGroupInfo {
  id: string;
  name: string;
  slug: string;
  selectionType: string;
}

export interface Modifier {
  id: string;
  modifierGroupId: string;
  modifierGroup?: ModifierGroupInfo;
  sku: string | null;
  name: string;
  description: string | null;
  additionalPrice: number;
  costPrice: number | null;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModifierDto {
  modifierGroupId: string;
  sku?: string;
  name: string;
  description?: string;
  additionalPrice?: number;
  costPrice?: number;
  isDefault?: boolean;
  isAvailable?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateModifierDto {
  modifierGroupId?: string;
  sku?: string;
  name?: string;
  description?: string;
  additionalPrice?: number;
  costPrice?: number;
  isDefault?: boolean;
  isAvailable?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface QueryModifierParams {
  page?: number;
  limit?: number;
  search?: string;
  modifierGroupId?: string;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'all';
  sort?: 'name' | 'sortOrder' | 'additionalPrice' | 'createdAt' | 'updatedAt';
  order?: 'ASC' | 'DESC';
}

export interface PaginatedModifiersResponse {
  data: Modifier[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const modifierApi = {
  getAll: async (params: QueryModifierParams = {}): Promise<PaginatedModifiersResponse> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.modifierGroupId) searchParams.set('modifierGroupId', params.modifierGroupId);
    if (params.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    if (params.status) searchParams.set('status', params.status);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.order) searchParams.set('order', params.order);

    const response = await apiClient.get<PaginatedModifiersResponse>(
      `/modifiers?${searchParams}`
    );
    return response.data;
  },

  getAllByGroup: async (modifierGroupId: string): Promise<Modifier[]> => {
    const response = await apiClient.get<ApiResponse<Modifier[]>>(`/modifiers/group/${modifierGroupId}`);
    return response.data.data || [];
  },

  getOne: async (id: string): Promise<Modifier> => {
    const response = await apiClient.get<ApiResponse<Modifier>>(`/modifiers/${id}`);
    return response.data.data;
  },

  create: async (data: CreateModifierDto): Promise<Modifier> => {
    const response = await apiClient.post<ApiResponse<Modifier>>('/modifiers', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateModifierDto): Promise<Modifier> => {
    const response = await apiClient.patch<ApiResponse<Modifier>>(`/modifiers/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/modifiers/${id}`);
    return response.data.data;
  },

  restore: async (id: string): Promise<Modifier> => {
    const response = await apiClient.post<ApiResponse<Modifier>>(`/modifiers/${id}/restore`);
    return response.data.data;
  },
};

export default modifierApi;
