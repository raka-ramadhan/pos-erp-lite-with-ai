import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import modifierApi, { QueryModifierParams, CreateModifierDto, UpdateModifierDto } from '../api/modifier.api';

export function useModifiers(params?: QueryModifierParams) {
  return useQuery({
    queryKey: ['modifiers', params],
    queryFn: () => modifierApi.getAll(params),
  });
}

export function useModifiersByGroup(modifierGroupId: string) {
  return useQuery({
    queryKey: ['modifiers', 'group', modifierGroupId],
    queryFn: () => modifierApi.getAllByGroup(modifierGroupId),
    enabled: !!modifierGroupId,
  });
}

export function useModifier(id: string) {
  return useQuery({
    queryKey: ['modifiers', id],
    queryFn: () => modifierApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateModifier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModifierDto) => modifierApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifiers'] });
    },
  });
}

export function useUpdateModifier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModifierDto }) =>
      modifierApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modifiers'] });
      queryClient.invalidateQueries({ queryKey: ['modifiers', variables.id] });
    },
  });
}

export function useDeleteModifier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => modifierApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifiers'] });
    },
  });
}

export function useRestoreModifier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => modifierApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifiers'] });
    },
  });
}
