# Task 7: Frontend — Transactions API Client

## Goal
Create API client for fetching transactions in the POS Cashier frontend.

## File to Create
- `pos-cashier/src/api/transactions.ts`

## API Methods Required

```typescript
// GET /api/transactions - List with filters
getList(params?: TransactionListParams): Promise<PaginatedTransactions>

// GET /api/transactions/:id - Get detail
getById(id: string): Promise<TransactionDetail>

// GET /api/transactions/:id/receipt - Get receipt
getReceipt(id: string): Promise<TransactionDetail>
```

## TypeScript Interfaces Required

```typescript
interface TransactionSummary {
  id: string;
  transactionNumber: string;
  orderType: 'dine_in' | 'take_away' | 'delivery';
  tableCode?: string | null;
  tableName?: string | null;
  paymentMethod?: string | null;
  totalAmount: number;
  completedAt: string;
}

interface TransactionModifier {
  id: string;
  modifierId: string;
  modifierName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface TransactionItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string | null;
  sortOrder: number;
  modifiers: TransactionModifier[];
}

interface TransactionPayment {
  id: string;
  paymentMethodId: string;
  paymentMethodName: string;
  paymentType: string;
  provider?: string | null;
  amount: number;
  totalAmount: number;
  changeAmount: number;
  referenceNumber?: string | null;
  cardNumber?: string | null;
  cardHolder?: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paidAt: string;
}

interface TransactionDiscount {
  discountId?: string | null;
  discountName?: string | null;
  discountType?: 'percentage' | 'fixed' | null;
  discountValue?: number | null;
  discountAmount: number;
}

interface TransactionTax {
  taxId?: string | null;
  taxName?: string | null;
  taxRate?: number | null;
  taxAmount: number;
}

interface TransactionDetail {
  id: string;
  transactionNumber: string;
  orderId: string;
  orderNumber: string;
  orderType: 'dine_in' | 'take_away' | 'delivery';
  tableId?: string | null;
  tableCode?: string | null;
  tableName?: string | null;
  cashierId?: string | null;
  cashierName?: string | null;
  subtotal: number;
  discount: TransactionDiscount;
  tax: TransactionTax;
  totalAmount: number;
  notes?: string | null;
  orderedAt: string;
  completedAt: string;
  items: TransactionItem[];
  payments: TransactionPayment[];
}

interface PaginatedTransactions {
  data: TransactionSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface TransactionListParams {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  orderType?: 'dine_in' | 'take_away' | 'delivery';
}
```

## Global Constraints
- Follow existing API client pattern in: pos-cashier/src/api/
- Use apiClient from './client'
- Use AxiosRequestConfig for query params

## Steps
1. Check existing API patterns in pos-cashier/src/api/
2. Create transactions.ts with all types and methods
3. Export as default
4. Commit

## Report Contract
Write report to: /var/www/html/pos-porfolio/.superpowers/sdd/task-7-report.md
