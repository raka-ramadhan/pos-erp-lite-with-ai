import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Role, ApiResponse } from '../types';

export interface QueryRolesParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
  status?: boolean;
}

export interface PaginatedRolesResponse {
  data: Role[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateRoleDto {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  permissionIds?: string[];
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {}

// Roles API functions
const rolesApi = {
  getAll: async (params: QueryRolesParams = {}): Promise<PaginatedRolesResponse> => {
    const response = await apiClient.get('/roles', { params });
    // Backend returns: { success, message, data: [...], meta: {...}, timestamp }
    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  },

  getOne: async (id: string): Promise<Role> => {
    const response = await apiClient.get<ApiResponse<Role>>(`/roles/${id}`);
    return response.data.data;
  },

  create: async (data: CreateRoleDto): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>('/roles', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateRoleDto): Promise<Role> => {
    const response = await apiClient.put<ApiResponse<Role>>(`/roles/${id}`, data);
    return response.data.data;
  },

  changeStatus: async (id: string, isActive: boolean): Promise<Role> => {
    const response = await apiClient.patch<ApiResponse<Role>>(`/roles/${id}/status`, { isActive });
    return response.data.data;
  },

  assignPermissions: async (id: string, permissionIds: string[]): Promise<Role> => {
    const response = await apiClient.put<ApiResponse<Role>>(`/roles/${id}/permissions`, { permissionIds });
    return response.data.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/roles/${id}`);
    return response.data.data;
  },
};

// Hook: Get paginated roles
export function useRoles(params: QueryRolesParams = {}) {
  return useQuery<PaginatedRolesResponse, Error>({
    queryKey: ['roles', params],
    queryFn: () => rolesApi.getAll(params),
    placeholderData: (previousData) => previousData,
    retry: false,
  });
}

// Hook: Get single role
export function useRole(id: string | null) {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => rolesApi.getOne(id!),
    enabled: !!id,
  });
}

// Hook: Create role
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

// Hook: Update role
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      rolesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] });
    },
  });
}

// Hook: Change role status
export function useChangeRoleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      rolesApi.changeStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

// Hook: Assign permissions
export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, permissionIds }: { id: string; permissionIds: string[] }) =>
      rolesApi.assignPermissions(id, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

// Hook: Delete role
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}
