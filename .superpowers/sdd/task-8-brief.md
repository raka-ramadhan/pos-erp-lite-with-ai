# Task 8: Frontend — Transactions Hook

## Goal
Create React Query hooks for fetching transactions.

## File to Create
- `pos-cashier/src/hooks/useTransactions.ts`

## Hooks Required

```typescript
// List transactions with filters
export function useTransactions(params?: TransactionListParams) {
  return useQuery({
    queryKey: ['transactions', 'list', params],
    queryFn: () => transactionsApi.getList(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get single transaction detail
export function useTransactionDetail(id: string) {
  return useQuery({
    queryKey: ['transactions', 'detail', id],
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
  });
}

// Get receipt data
export function useReceipt(id: string) {
  return useQuery({
    queryKey: ['transactions', 'receipt', id],
    queryFn: () => transactionsApi.getReceipt(id),
    enabled: !!id,
  });
}
```

## Global Constraints
- Follow existing hook patterns in: pos-cashier/src/hooks/
- Use @tanstack/react-query
- Import from '../api/transactions'

## Steps
1. Create useTransactions.ts with 3 hooks
2. Export all hooks
3. Commit

## Report Contract
Write report to: /var/www/html/pos-porfolio/.superpowers/sdd/task-8-report.md
