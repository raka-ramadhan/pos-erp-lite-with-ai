import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryApi, { QueryCategoryParams, CreateCategoryDto, UpdateCategoryDto } from '../api/category.api';

// Hook: Get paginated categories
export function useCategories(params: QueryCategoryParams = {}) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryApi.getAll(params),
    placeholderData: (previousData) => previousData,
    retry: false,
  });
}

// Hook: Get all active categories (for dropdowns)
export function useActiveCategories() {
  return useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => categoryApi.getAllActive(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// Hook: Get single category
export function useCategory(id: string | null) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoryApi.getOne(id!),
    enabled: !!id,
  });
}

// Hook: Create category
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Hook: Update category
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoryApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', variables.id] });
    },
  });
}

// Hook: Delete category
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Hook: Restore category
export function useRestoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
