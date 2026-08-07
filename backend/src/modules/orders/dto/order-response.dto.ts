import { OrderItemModifier } from '../entities/order-item-modifier.entity';

export class OrderItemModifierResponseDto {
  id!: string;
  modifierId!: string;
  modifierName!: string;
  quantity!: number;
  unitPrice!: number;
  totalAmount!: number;
}

export class OrderItemResponseDto {
  id!: string;
  orderId!: string;
  productId!: string;
  productName!: string | null;
  variantName!: string | null;
  quantity!: number;
  unitPrice!: number;
  subtotal!: number;
  notes!: string | null;
  sortOrder!: number;
  modifiers!: OrderItemModifierResponseDto[];
  createdAt!: Date;
  updatedAt!: Date;
}

export class TableResponseDto {
  id!: string;
  tableCode!: string;
  tableName!: string;
  areaName!: string | null;
}

export class OrderResponseDto {
  id!: string;
  orderNumber!: string;
  orderType!: string;
  orderStatus!: string;
  subtotal!: number;
  taxAmount!: number;
  discountAmount!: number;
  totalAmount!: number;
  totalPaid!: number;
  changeAmount!: number;
  customerCount!: number;
  notes!: string | null;
  table!: TableResponseDto | null;
  orderedAt!: Date;
  createdAt!: Date;
  updatedAt!: Date;
}

export class OrderWithItemsResponseDto {
  order!: OrderResponseDto;
  items!: OrderItemResponseDto[];
}

export class OrderCalculationResponseDto {
  subtotal!: number;
  productDiscountTotal!: number;
  subtotalAfterProductDiscount!: number;
  orderDiscountAmount!: number;
  subtotalAfterDiscount!: number;
  serviceChargeAmount!: number;
  taxAmount!: number;
  totalAmount!: number;
  appliedDiscountId!: string | null;
  appliedDiscountName!: string | null;
}
