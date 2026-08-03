import apiClient from './client';
import type { ApiResponse } from '../types';

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
  status?: boolean;
  roleId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  role: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

const userApi = {
  getAll: async (params: QueryParams = {}): Promise<PaginatedResponse<UserResponse>> => {
    const response = await apiClient.get('/users', { params });
    // Backend returns: { success, message, data: [...], meta: {...}, timestamp }
    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  },

  getOne: async (id: string): Promise<UserResponse> => {
    const response = await apiClient.get<ApiResponse<UserResponse>>(`/users/${id}`);
    return response.data.data;
  },

  create: async (data: CreateUserDto): Promise<UserResponse> => {
    const response = await apiClient.post<ApiResponse<UserResponse>>('/users', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<UserResponse> => {
    const response = await apiClient.patch<ApiResponse<UserResponse>>(`/users/${id}`, data);
    return response.data.data;
  },

  changeStatus: async (id: string, isActive: boolean): Promise<UserResponse> => {
    const response = await apiClient.patch<ApiResponse<UserResponse>>(`/users/${id}/status`, { isActive });
    return response.data.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/users/${id}`);
    return response.data.data;
  },
};

export default userApi;
