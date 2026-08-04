import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuPermissionApi from '../api/menu-permission.api';

export function useMenuPermissions() {
  return useQuery({
    queryKey: ['menuPermissions'],
    queryFn: () => menuPermissionApi.getAllMenusWithPermissions(),
  });
}

export function useAllPermissions() {
  return useQuery({
    queryKey: ['allPermissions'],
    queryFn: () => menuPermissionApi.getAllPermissions(),
  });
}

export function useMenuPermission(menuId: string) {
  return useQuery({
    queryKey: ['menuPermission', menuId],
    queryFn: () => menuPermissionApi.getMenuPermissions(menuId),
    enabled: !!menuId,
  });
}

export function useAssignMenuPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, permissionIds }: { menuId: string; permissionIds: string[] }) =>
      menuPermissionApi.assignPermissions(menuId, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuPermissions'] });
    },
  });
}

export function useSetMenuPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, permissionIds }: { menuId: string; permissionIds: string[] }) =>
      menuPermissionApi.setPermissions(menuId, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuPermissions'] });
    },
  });
}

export function useRemoveMenuPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, permissionIds }: { menuId: string; permissionIds: string[] }) =>
      menuPermissionApi.removePermissions(menuId, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuPermissions'] });
    },
  });
}
