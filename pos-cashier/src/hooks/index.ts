// Auth hooks
export * from './useAuth';

// Permission hooks
export * from './usePermission';

// POS hooks
export * from './useProducts';
export * from './useTables';
export * from './useCart';
export * from './useOrders';
export { useTransactions, useTransactionDetail, useReceipt } from './useTransactions';
export { useTaxes, useDiscounts, useOrderCalculation, useApplyDiscount, useRemoveDiscount } from './useCalculation';

// Simple cart hook (backend-first, no sync)
export * from './useSimpleCart';

// Payment hooks
export { usePaymentMethods, useIsOrderPaid } from './usePaymentMethods';
export { useProcessPayment } from './useProcessPayment';

// Order items hooks
export { useOrderWithItems, useOrderItems, useAddOrderItem, useUpdateOrderItem, useUpdateOrderItemNotes, useRemoveOrderItem } from './useOrderItems';
