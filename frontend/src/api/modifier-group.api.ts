import apiClient from './client';
import type { ApiResponse } from '../types';

export interface ModifierGroup {
  id: string;
  outletId: string | null;
  name: string;
  slug: string;
  description: string | null;
  selectionType: string;
  isRequired: boolean;
  minSelections: number | null;
  maxSelections: number | null;
  sortOrder: number;
  isActive: boolean;
  modifierCount?: number;
  modifiers?: Modifier[];
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Modifier {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  additionalPrice: number;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateModifierGroupDto {
  name: string;
  slug?: string;
  description?: string;
  selectionType?: 'single' | 'multiple';
  isRequired?: boolean;
  minSelections?: number;
  maxSelections?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateModifierGroupDto {
  name?: string;
  slug?: string;
  description?: string;
  selectionType?: 'single' | 'multiple';
  isRequired?: boolean;
  minSelections?: number;
  maxSelections?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface QueryModifierGroupParams {
  page?: number;
  limit?: number;
  search?: string;
  selectionType?: 'single' | 'multiple';
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'all';
  sort?: 'name' | 'sortOrder' | 'createdAt' | 'updatedAt';
  order?: 'ASC' | 'DESC';
}

export interface PaginatedModifierGroupsResponse {
  data: ModifierGroup[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const modifierGroupApi = {
  getAll: async (params: QueryModifierGroupParams = {}): Promise<PaginatedModifierGroupsResponse> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.selectionType) searchParams.set('selectionType', params.selectionType);
    if (params.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    if (params.status) searchParams.set('status', params.status);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.order) searchParams.set('order', params.order);

    const response = await apiClient.get<PaginatedModifierGroupsResponse>(
      `/modifier-groups?${searchParams}`
    );
    return response.data;
  },

  getAllActive: async (): Promise<ModifierGroup[]> => {
    const response = await apiClient.get<ApiResponse<ModifierGroup[]>>('/modifier-groups/active');
    return response.data.data || [];
  },

  getOne: async (id: string): Promise<ModifierGroup> => {
    const response = await apiClient.get<ApiResponse<ModifierGroup>>(`/modifier-groups/${id}`);
    return response.data.data;
  },

  create: async (data: CreateModifierGroupDto): Promise<ModifierGroup> => {
    const response = await apiClient.post<ApiResponse<ModifierGroup>>('/modifier-groups', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateModifierGroupDto): Promise<ModifierGroup> => {
    const response = await apiClient.patch<ApiResponse<ModifierGroup>>(`/modifier-groups/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/modifier-groups/${id}`);
    return response.data.data;
  },

  restore: async (id: string): Promise<ModifierGroup> => {
    const response = await apiClient.post<ApiResponse<ModifierGroup>>(`/modifier-groups/${id}/restore`);
    return response.data.data;
  },
};

export default modifierGroupApi;
