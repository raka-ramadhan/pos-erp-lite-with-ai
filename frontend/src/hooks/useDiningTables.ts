import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import diningTableApi, {
  QueryDiningTableParams,
  CreateDiningTableDto,
  UpdateDiningTableDto,
} from '../api/dining-table.api';

// Hook: Get paginated dining tables
export function useDiningTables(params: QueryDiningTableParams = {}) {
  return useQuery({
    queryKey: ['dining-tables', params],
    queryFn: () => diningTableApi.getAll(params),
    placeholderData: (previousData) => previousData,
    retry: false,
  });
}

// Hook: Get all active dining tables
export function useActiveDiningTables() {
  return useQuery({
    queryKey: ['dining-tables', 'active'],
    queryFn: () => diningTableApi.getAllActive(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// Hook: Get distinct areas
export function useDistinctAreas() {
  return useQuery({
    queryKey: ['dining-tables', 'areas'],
    queryFn: () => diningTableApi.getDistinctAreas(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
}

// Hook: Get single dining table
export function useDiningTable(id: string | null) {
  return useQuery({
    queryKey: ['dining-tables', id],
    queryFn: () => diningTableApi.getOne(id!),
    enabled: !!id,
  });
}

// Hook: Create dining table
export function useCreateDiningTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiningTableDto) => diningTableApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dining-tables'] });
    },
  });
}

// Hook: Update dining table
export function useUpdateDiningTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiningTableDto }) =>
      diningTableApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dining-tables'] });
      queryClient.invalidateQueries({ queryKey: ['dining-tables', variables.id] });
    },
  });
}

// Hook: Delete dining table
export function useDeleteDiningTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => diningTableApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dining-tables'] });
    },
  });
}

// Hook: Restore dining table
export function useRestoreDiningTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => diningTableApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dining-tables'] });
    },
  });
}
