import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userApi, { QueryParams, CreateUserDto, UpdateUserDto } from '../api/user.api';
import type { PaginatedResponse } from '../api/user.api';

// Hook: Get paginated users
export function useUsers(params: QueryParams = {}) {
  return useQuery<PaginatedResponse<any>, Error>({
    queryKey: ['users', params],
    queryFn: () => userApi.getAll(params),
    placeholderData: (previousData) => previousData,
    retry: false,
  });
}

// Hook: Get single user
export function useUser(id: string | null) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userApi.getOne(id!),
    enabled: !!id,
  });
}

// Hook: Create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook: Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      userApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
}

// Hook: Change user status
export function useChangeUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userApi.changeStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
}

// Hook: Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
