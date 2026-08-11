import { TransactionOrderType, DiscountType } from '../entities/transaction.entity';
import { TransactionPaymentStatus } from '../entities/transaction-payment.entity';

export class TransactionItemModifierDto {
  id!: string;
  modifierId!: string;
  modifierName!: string;
  quantity!: number;
  unitPrice!: number;
  totalAmount!: number;
}

export class TransactionItemDto {
  id!: string;
  productId!: string;
  productName!: string;
  variantName!: string | null;
  quantity!: number;
  unitPrice!: number;
  subtotal!: number;
  notes!: string | null;
  sortOrder!: number;
  modifiers!: TransactionItemModifierDto[];
}

export class TransactionPaymentDto {
  id!: string;
  paymentMethodId!: string;
  paymentMethodName!: string;
  paymentType!: string;
  provider!: string | null;
  amount!: number;
  totalAmount!: number;
  changeAmount!: number;
  referenceNumber!: string | null;
  cardNumber!: string | null;
  cardHolder!: string | null;
  status!: TransactionPaymentStatus;
  paidAt!: Date | null;
}

export class DiscountInfoDto {
  discountId!: string | null;
  discountName!: string | null;
  discountType!: DiscountType | null;
  discountValue!: number | null;
  discountAmount!: number;
}

export class TaxInfoDto {
  taxId!: string | null;
  taxName!: string | null;
  taxRate!: number | null;
  taxAmount!: number;
}

export class TransactionSummaryDto {
  id!: string;
  transactionNumber!: string;
  orderType!: TransactionOrderType;
  tableCode!: string | null;
  tableName!: string | null;
  cashierName!: string | null;
  subtotal!: number;
  discountAmount!: number;
  taxAmount!: number;
  totalAmount!: number;
  orderedAt!: Date;
  completedAt!: Date | null;
  itemCount!: number;
  paymentStatus!: string;
}

export class TransactionDetailDto {
  id!: string;
  transactionNumber!: string;
  orderId!: string | null;
  orderNumber!: string | null;
  orderType!: TransactionOrderType;
  tableId!: string | null;
  tableCode!: string | null;
  tableName!: string | null;
  cashierId!: string | null;
  cashierName!: string | null;
  subtotal!: number;
  discount!: DiscountInfoDto;
  tax!: TaxInfoDto;
  totalAmount!: number;
  notes!: string | null;
  orderedAt!: Date;
  completedAt!: Date | null;
  items!: TransactionItemDto[];
  payments!: TransactionPaymentDto[];
}

export class PaginatedTransactionDto {
  data!: TransactionSummaryDto[];
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
