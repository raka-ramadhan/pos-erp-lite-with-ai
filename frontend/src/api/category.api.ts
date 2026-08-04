import apiClient from './client';
import type { ApiResponse } from '../types';

export interface QueryCategoryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'name' | 'slug' | 'sortOrder' | 'createdAt' | 'updatedAt';
  order?: 'ASC' | 'DESC';
  parentId?: string;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'all';
}

export interface PaginatedCategoryResponse {
  data: CategoryResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  mediaId?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  mediaId?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CategoryResponse {
  id: string;
  outletId: string | null;
  parentId: string | null;
  parent: {
    id: string;
    name: string;
  } | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  mediaId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default {
  getAll: async (params: QueryCategoryParams = {}): Promise<PaginatedCategoryResponse> => {
    const response = await apiClient.get('/categories', { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  },

  getAllActive: async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get('/categories/active');
    return response.data.data || [];
  },

  getOne: async (id: string): Promise<CategoryResponse> => {
    const response = await apiClient.get<ApiResponse<CategoryResponse>>(`/categories/${id}`);
    return response.data.data;
  },

  create: async (data: CreateCategoryDto): Promise<CategoryResponse> => {
    const response = await apiClient.post<ApiResponse<CategoryResponse>>('/categories', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateCategoryDto): Promise<CategoryResponse> => {
    const response = await apiClient.patch<ApiResponse<CategoryResponse>>(`/categories/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/categories/${id}`);
    return response.data.data;
  },

  restore: async (id: string): Promise<CategoryResponse> => {
    const response = await apiClient.post<ApiResponse<CategoryResponse>>(`/categories/${id}/restore`);
    return response.data.data;
  },
};

