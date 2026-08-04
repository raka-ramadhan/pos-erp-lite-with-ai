import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import modifierGroupApi, { QueryModifierGroupParams, CreateModifierGroupDto, UpdateModifierGroupDto } from '../api/modifier-group.api';

export function useModifierGroups(params?: QueryModifierGroupParams) {
  return useQuery({
    queryKey: ['modifierGroups', params],
    queryFn: () => modifierGroupApi.getAll(params),
  });
}

export function useActiveModifierGroups() {
  return useQuery({
    queryKey: ['modifierGroups', 'active'],
    queryFn: () => modifierGroupApi.getAllActive(),
  });
}

export function useModifierGroup(id: string) {
  return useQuery({
    queryKey: ['modifierGroups', id],
    queryFn: () => modifierGroupApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateModifierGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModifierGroupDto) => modifierGroupApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifierGroups'] });
    },
  });
}

export function useUpdateModifierGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModifierGroupDto }) =>
      modifierGroupApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modifierGroups'] });
      queryClient.invalidateQueries({ queryKey: ['modifierGroups', variables.id] });
    },
  });
}

export function useDeleteModifierGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => modifierGroupApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifierGroups'] });
    },
  });
}

export function useRestoreModifierGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => modifierGroupApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifierGroups'] });
    },
  });
}
