import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import discountsApi, { type QueryDiscountParams, type CreateDiscountDto, type UpdateDiscountDto } from '../api/discount.api';

export function useDiscounts(params?: QueryDiscountParams) {
  return useQuery({
    queryKey: ['discounts', params],
    queryFn: () => discountsApi.getAll(params),
  });
}

export function useActiveDiscounts() {
  return useQuery({
    queryKey: ['discounts', 'active'],
    queryFn: () => discountsApi.getAllActive(),
  });
}

export function useDiscount(id: string) {
  return useQuery({
    queryKey: ['discounts', id],
    queryFn: () => discountsApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDiscountDto) => discountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
}

export function useUpdateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiscountDto }) =>
      discountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
}

export function useDeleteDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => discountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
}

export function useRestoreDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => discountsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
}
