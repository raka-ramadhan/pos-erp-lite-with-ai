import apiClient from './client';
import type { ApiResponse } from '../types';

export interface PermissionSimple {
  id: string;
  code: string;
  name: string;
}

export interface MenuPermissionResponse {
  menuId: string;
  menuName: string;
  menuCode: string;
  permissions: PermissionSimple[];
}

export interface AssignPermissionsDto {
  permissionIds: string[];
}

const menuPermissionApi = {
  /**
   * Get all menus with their assigned permissions
   */
  getAllMenusWithPermissions: async (): Promise<MenuPermissionResponse[]> => {
    const response = await apiClient.get<ApiResponse<MenuPermissionResponse[]>>(
      '/menus/permissions/all'
    );
    return response.data.data || [];
  },

  /**
   * Get all available permissions
   */
  getAllPermissions: async (): Promise<PermissionSimple[]> => {
    const response = await apiClient.get<ApiResponse<PermissionSimple[]>>(
      '/menus/permissions/permissions-list'
    );
    return response.data.data || [];
  },

  /**
   * Get permissions for a specific menu
   */
  getMenuPermissions: async (menuId: string): Promise<MenuPermissionResponse> => {
    const response = await apiClient.get<ApiResponse<MenuPermissionResponse>>(
      `/menus/${menuId}/permissions`
    );
    return response.data.data;
  },

  /**
   * Assign permissions to a menu (additive)
   */
  assignPermissions: async (
    menuId: string,
    permissionIds: string[]
  ): Promise<MenuPermissionResponse> => {
    const response = await apiClient.post<ApiResponse<MenuPermissionResponse>>(
      `/menus/${menuId}/permissions`,
      { permissionIds }
    );
    return response.data.data;
  },

  /**
   * Set permissions for a menu (replace all)
   */
  setPermissions: async (
    menuId: string,
    permissionIds: string[]
  ): Promise<MenuPermissionResponse> => {
    const response = await apiClient.put<ApiResponse<MenuPermissionResponse>>(
      `/menus/${menuId}/permissions`,
      { permissionIds }
    );
    return response.data.data;
  },

  /**
   * Remove permissions from a menu
   */
  removePermissions: async (
    menuId: string,
    permissionIds: string[]
  ): Promise<MenuPermissionResponse> => {
    const response = await apiClient.delete<ApiResponse<MenuPermissionResponse>>(
      `/menus/${menuId}/permissions`,
      { data: { permissionIds } }
    );
    return response.data.data;
  },
};

export default menuPermissionApi;
