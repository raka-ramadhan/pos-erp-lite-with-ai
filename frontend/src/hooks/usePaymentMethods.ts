import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import paymentMethodApi, { QueryPaymentMethodParams, CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../api/payment-method.api';

export function usePaymentMethods(params?: QueryPaymentMethodParams) {
  return useQuery({
    queryKey: ['paymentMethods', params],
    queryFn: () => paymentMethodApi.getAll(params),
  });
}

export function useActivePaymentMethods() {
  return useQuery({
    queryKey: ['paymentMethods', 'active'],
    queryFn: () => paymentMethodApi.getAllActive(),
  });
}

export function usePaymentMethod(id: string) {
  return useQuery({
    queryKey: ['paymentMethods', id],
    queryFn: () => paymentMethodApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentMethodDto) => paymentMethodApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentMethodDto }) =>
      paymentMethodApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      queryClient.invalidateQueries({ queryKey: ['paymentMethods', id] });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentMethodApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
}

export function useRestorePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentMethodApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
}
