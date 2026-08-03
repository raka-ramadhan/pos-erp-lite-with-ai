import apiClient from './client';
import type { ApiResponse, Permission } from '../types';

export interface QueryPermissionParams {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  status?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedPermissionResponse {
  data: Permission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Re-export for convenience
export type { Permission } from '../types';

export interface CreatePermissionDto {
  name: string;
  code: string;
  description?: string;
  group?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePermissionDto extends Partial<CreatePermissionDto> {}

export interface PermissionGrouped {
  group: string;
  permissions: Permission[];
}

export interface PermissionDetail {
  id: string;
  code: string;
  name: string;
  description: string | null;
  group: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  roles: {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    usersCount: number;
  }[];
  menus: {
    id: string;
    code: string;
    name: string;
    type: string;
    path: string;
  }[];
}

const permissionApi = {
  getAll: async (params: QueryPermissionParams = {}): Promise<PaginatedPermissionResponse> => {
    const response = await apiClient.get('/permissions', { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  },

  getAllGrouped: async (): Promise<PermissionGrouped[]> => {
    const response = await apiClient.get<ApiResponse<PermissionGrouped[]>>('/permissions/grouped');
    return response.data.data;
  },

  getModules: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/permissions/modules');
    return response.data.data;
  },

  getOne: async (id: string): Promise<Permission> => {
    const response = await apiClient.get<ApiResponse<Permission>>(`/permissions/${id}`);
    return response.data.data;
  },

  getOneDetailed: async (id: string): Promise<PermissionDetail> => {
    const response = await apiClient.get<ApiResponse<PermissionDetail>>(`/permissions/${id}/detail`);
    return response.data.data;
  },

  create: async (data: CreatePermissionDto): Promise<Permission> => {
    const response = await apiClient.post<ApiResponse<Permission>>('/permissions', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdatePermissionDto): Promise<Permission> => {
    const response = await apiClient.put<ApiResponse<Permission>>(`/permissions/${id}`, data);
    return response.data.data;
  },

  changeStatus: async (id: string, isActive: boolean): Promise<Permission> => {
    const response = await apiClient.patch<ApiResponse<Permission>>(`/permissions/${id}/status`, { isActive });
    return response.data.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/permissions/${id}`);
    return response.data.data;
  },
};

export default permissionApi;
