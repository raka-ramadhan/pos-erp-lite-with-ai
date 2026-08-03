import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { MenuItem, ApiResponse } from '../types';

// Menu API functions
const menuApi = {
  getSidebar: async (): Promise<MenuItem[]> => {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/menus/sidebar');
    return response.data.data;
  },

  getSidebarAdmin: async (): Promise<MenuItem[]> => {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/menus/sidebar/admin');
    return response.data.data;
  },
};

// Hook: Get sidebar menus for current user
export function useSidebar() {
  return useQuery({
    queryKey: ['sidebar'],
    queryFn: menuApi.getSidebar,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// Hook: Get all sidebar menus (admin view)
export function useSidebarAdmin() {
  return useQuery({
    queryKey: ['sidebar', 'admin'],
    queryFn: menuApi.getSidebarAdmin,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
