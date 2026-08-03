import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { MenuItem, ApiResponse } from '../types';

interface CreateMenuDto {
  name: string;
  code: string;
  description?: string;
  type?: 'GROUP' | 'MENU' | 'SUBMENU' | 'LINK';
  icon?: string;
  path?: string;
  sortOrder?: number;
  isActive?: boolean;
  isHidden?: boolean;
  parentId?: string;
  permissionId?: string;
}

interface UpdateMenuDto extends Partial<CreateMenuDto> {}

// Menus API functions
const menusApi = {
  getAll: async (): Promise<MenuItem[]> => {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/menus');
    return response.data.data;
  },

  getOne: async (id: string): Promise<MenuItem> => {
    const response = await apiClient.get<ApiResponse<MenuItem>>(`/menus/${id}`);
    return response.data.data;
  },

  create: async (data: CreateMenuDto): Promise<MenuItem> => {
    const response = await apiClient.post<ApiResponse<MenuItem>>('/menus', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateMenuDto): Promise<MenuItem> => {
    const response = await apiClient.patch<ApiResponse<MenuItem>>(`/menus/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/menus/${id}`);
  },
};

// Hook: Get all menus
export function useMenus() {
  return useQuery({
    queryKey: ['menus'],
    queryFn: menusApi.getAll,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook: Get single menu
export function useMenu(id: string) {
  return useQuery({
    queryKey: ['menus', id],
    queryFn: () => menusApi.getOne(id),
    enabled: !!id,
  });
}

// Hook: Create menu
export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menusApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

// Hook: Update menu
export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuDto }) =>
      menusApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

// Hook: Delete menu
export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menusApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}
