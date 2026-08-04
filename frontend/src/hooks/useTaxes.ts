import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taxApi, { QueryTaxParams, CreateTaxDto, UpdateTaxDto } from '../api/tax.api';

export function useTaxes(params?: QueryTaxParams) {
  return useQuery({
    queryKey: ['taxes', params],
    queryFn: () => taxApi.getAll(params),
  });
}

export function useActiveTaxes() {
  return useQuery({
    queryKey: ['taxes', 'active'],
    queryFn: () => taxApi.getAllActive(),
  });
}

export function useTax(id: string) {
  return useQuery({
    queryKey: ['taxes', id],
    queryFn: () => taxApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateTax() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaxDto) => taxApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
    },
  });
}

export function useUpdateTax() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaxDto }) =>
      taxApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      queryClient.invalidateQueries({ queryKey: ['taxes', id] });
    },
  });
}

export function useDeleteTax() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taxApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
    },
  });
}

export function useRestoreTax() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taxApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
    },
  });
}
