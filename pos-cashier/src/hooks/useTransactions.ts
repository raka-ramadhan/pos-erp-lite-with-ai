import { useQuery } from '@tanstack/react-query';
import transactionsApi, { type TransactionListParams } from '../api/transactions';

/**
 * Hook to fetch paginated list of transactions with optional filters
 */
export function useTransactions(params?: TransactionListParams) {
  return useQuery({
    queryKey: ['transactions', 'list', params],
    queryFn: () => transactionsApi.getList(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single transaction detail by ID
 */
export function useTransactionDetail(id: string) {
  return useQuery({
    queryKey: ['transactions', 'detail', id],
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch receipt data for a transaction
 */
export function useReceipt(id: string) {
  return useQuery({
    queryKey: ['transactions', 'receipt', id],
    queryFn: () => transactionsApi.getReceipt(id),
    enabled: !!id,
  });
}
