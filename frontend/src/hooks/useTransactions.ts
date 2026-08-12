import { useQuery } from '@tanstack/react-query';
import { transactionsApi, type TransactionListParams } from '../api/transactions.api';

export function useTransactions(params?: TransactionListParams) {
  return useQuery({
    queryKey: ['transactions', 'list', params],
    queryFn: () => transactionsApi.getList(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useTransactionDetail(id: string | null) {
  return useQuery({
    queryKey: ['transactions', 'detail', id],
    queryFn: () => transactionsApi.getById(id!),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useTransactionReceipt(id: string | null) {
  return useQuery({
    queryKey: ['transactions', 'receipt', id],
    queryFn: () => transactionsApi.getReceipt(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
