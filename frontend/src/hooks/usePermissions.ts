import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import permissionApi, {
  QueryPermissionParams,
  CreatePermissionDto,
  UpdatePermissionDto,
  PaginatedPermissionResponse,
  PermissionDetail,
} from '../api/permission.api';

// Re-export for convenience
export type { PermissionDetail } from '../api/permission.api';

// Hook: Get paginated permissions
export function usePermissions(params: QueryPermissionParams = {}) {
  return useQuery<PaginatedPermissionResponse, Error>({
    queryKey: ['permissions', params],
    queryFn: () => permissionApi.getAll(params),
    placeholderData: (previousData) => previousData,
    retry: false,
  });
}

// Hook: Get grouped permissions (for reference)
export function usePermissionsGrouped() {
  return useQuery({
    queryKey: ['permissions', 'grouped'],
    queryFn: () => permissionApi.getAllGrouped(),
    retry: false,
  });
}

// Hook: Get modules list
export function useModules() {
  return useQuery({
    queryKey: ['permissions', 'modules'],
    queryFn: () => permissionApi.getModules(),
    retry: false,
  });
}

// Hook: Get single permission
export function usePermission(id: string | null) {
  return useQuery({
    queryKey: ['permissions', id],
    queryFn: () => permissionApi.getOne(id!),
    enabled: !!id,
  });
}

// Hook: Get permission detail with roles and menus
export function usePermissionDetail(id: string | null) {
  return useQuery<PermissionDetail>({
    queryKey: ['permissions', id, 'detail'],
    queryFn: () => permissionApi.getOneDetailed(id!),
    enabled: !!id,
  });
}

// Hook: Create permission
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermissionDto) => permissionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });
}

// Hook: Update permission
export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionDto }) =>
      permissionApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permissions', variables.id] });
    },
  });
}

// Hook: Change permission status
export function useChangePermissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      permissionApi.changeStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });
}

// Hook: Delete permission
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permissionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });
}
