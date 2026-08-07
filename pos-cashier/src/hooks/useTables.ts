import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { DiningTable, TableArea, ApiResponse } from '../types';

// Active order info for POS
export interface ActiveOrderInfo {
  id: string;
  orderNumber: string;
  orderStatus: 'open' | 'in_progress' | 'completed' | 'cancelled';
  customerCount: number;
  itemCount: number;
  totalAmount: number;
  orderedAt: string;
  durationMinutes: number;
}

// POS Table with active order info
export interface POSTable extends DiningTable {
  activeOrder: ActiveOrderInfo | null;
}

// Table API functions
const tableApi = {
  // Get all active tables (for general use)
  getTables: async (): Promise<DiningTable[]> => {
    const response = await apiClient.get<ApiResponse<DiningTable[]>>('/dining-tables/active');
    return response.data.data;
  },

  // Get POS tables with active order info
  getPOSTables: async (): Promise<POSTable[]> => {
    const response = await apiClient.get<ApiResponse<POSTable[]>>('/dining-tables/pos');
    return response.data.data;
  },

  // Get table areas
  getTableAreas: async (): Promise<TableArea[]> => {
    const response = await apiClient.get<ApiResponse<TableArea[]>>('/dining-tables/areas');
    return response.data.data;
  },

  // Get single table
  getTable: async (id: string): Promise<DiningTable> => {
    const response = await apiClient.get<ApiResponse<DiningTable>>(`/dining-tables/${id}`);
    return response.data.data;
  },

  // Update table status
  updateTableStatus: async (
    id: string,
    status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  ): Promise<DiningTable> => {
    const response = await apiClient.patch<ApiResponse<DiningTable>>(
      `/dining-tables/${id}`,
      { status }
    );
    return response.data.data;
  },
};

// Hook: Get POS tables with active order info (main hook for tables page)
export function usePOSTables() {
  return useQuery({
    queryKey: ['tables', 'pos'],
    queryFn: tableApi.getPOSTables,
    staleTime: 10 * 1000, // 10 seconds - faster refresh for operational data
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// Hook: Get all tables (for general use)
export function useTables() {
  return useQuery({
    queryKey: ['tables', 'active'],
    queryFn: tableApi.getTables,
    staleTime: 30 * 1000, // 30 seconds (tables change frequently)
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Hook: Get table areas
export function useTableAreas() {
  return useQuery({
    queryKey: ['tables', 'areas'],
    queryFn: tableApi.getTableAreas,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook: Get single table
export function useTable(id: string) {
  return useQuery({
    queryKey: ['tables', id],
    queryFn: () => tableApi.getTable(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

// Hook: Get tables grouped by area
export function useTablesByArea() {
  const { data: tables, ...rest } = useTables();

  const tablesByArea = tables?.reduce(
    (acc, table) => {
      const area = table.areaName || 'Other';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(table);
      return acc;
    },
    {} as Record<string, DiningTable[]>
  );

  return {
    data: tablesByArea,
    tables,
    ...rest,
  };
}

// Hook: Get available tables only
export function useAvailableTables() {
  const { data: tables, ...rest } = useTables();

  return {
    data: tables?.filter((table) => table.status === 'available'),
    ...rest,
  };
}

// Hook: Update table status
export function useUpdateTableStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    }) => tableApi.updateTableStatus(id, status),
    onSuccess: () => {
      // Invalidate tables cache to refetch
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}
