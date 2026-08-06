import apiClient from './client';
import type { ApiResponse } from '../types';

export type DiningTableStatus = 'available' | 'reserved' | 'cleaning' | 'inactive';

export interface QueryDiningTableParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'tableCode' | 'tableName' | 'areaName' | 'capacity' | 'sortOrder' | 'status' | 'isActive' | 'createdAt' | 'updatedAt';
  order?: 'ASC' | 'DESC';
  areaName?: string;
  status?: DiningTableStatus;
  isActive?: boolean;
}

export interface PaginatedDiningTableResponse {
  data: DiningTableResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateDiningTableDto {
  tableCode: string;
  tableName: string;
  areaName?: string;
  description?: string;
  capacity?: number;
  sortOrder?: number;
  isActive?: boolean;
  status?: DiningTableStatus;
}

export interface UpdateDiningTableDto {
  tableCode?: string;
  tableName?: string;
  areaName?: string | null;
  description?: string | null;
  capacity?: number;
  sortOrder?: number;
  isActive?: boolean;
  status?: DiningTableStatus;
}

export interface DiningTableResponse {
  id: string;
  outletId: string | null;
  tableCode: string;
  tableName: string;
  areaName: string | null;
  description: string | null;
  capacity: number;
  sortOrder: number;
  isActive: boolean;
  status: DiningTableStatus;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export default {
  getAll: async (params: QueryDiningTableParams = {}): Promise<PaginatedDiningTableResponse> => {
    const response = await apiClient.get('/dining-tables', { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  },

  getAllActive: async (): Promise<DiningTableResponse[]> => {
    const response = await apiClient.get('/dining-tables/active');
    return response.data.data || [];
  },

  getDistinctAreas: async (): Promise<string[]> => {
    const response = await apiClient.get('/dining-tables/areas');
    return response.data.data || [];
  },

  getOne: async (id: string): Promise<DiningTableResponse> => {
    const response = await apiClient.get<ApiResponse<DiningTableResponse>>(`/dining-tables/${id}`);
    return response.data.data;
  },

  create: async (data: CreateDiningTableDto): Promise<DiningTableResponse> => {
    const response = await apiClient.post<ApiResponse<DiningTableResponse>>('/dining-tables', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateDiningTableDto): Promise<DiningTableResponse> => {
    const response = await apiClient.patch<ApiResponse<DiningTableResponse>>(`/dining-tables/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/dining-tables/${id}`);
    return response.data.data;
  },

  restore: async (id: string): Promise<DiningTableResponse> => {
    const response = await apiClient.post<ApiResponse<DiningTableResponse>>(`/dining-tables/${id}/restore`);
    return response.data.data;
  },
};
