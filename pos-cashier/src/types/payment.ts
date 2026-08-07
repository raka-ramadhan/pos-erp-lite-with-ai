// Payment types

export type PaymentType = 'cash' | 'card' | 'qris' | 'ewallet';

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  paymentType: PaymentType;
  provider: string | null;
  isIntegration: boolean;
  icon: string;
  isActive: boolean;
}

// Tax configuration
export interface Tax {
  id: string;
  code: string;
  name: string;
  taxType: 'percentage' | 'fixed';
  rate: number; // For percentage: 0.11 = 11%
  isDefault: boolean;
  isActive: boolean;
}

// Discount configuration
export interface Discount {
  id: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// Payment record
export interface PaymentRecord {
  id: string;
  paymentMethodId: string;
  paymentMethodName: string;
  amount: number;
  referenceNumber: string | null;
  cardNumber: string | null;
}

// Cart summary calculations
export interface CartSummary {
  subtotal: number;
  itemCount: number;
  taxAmount: number;
  taxRate: number;
  discountAmount: number;
  discountCode: string | null;
  total: number;
}

// Cash payment details
export interface CashPaymentDetails {
  amountTendered: number;
  change: number;
}

// Card payment details
export interface CardPaymentDetails {
  referenceNumber: string;
  cardNumber?: string;
  cardHolder?: string;
}

// QRIS payment details
export interface QRISPaymentDetails {
  referenceNumber: string;
  provider: string;
}

// Payment state
export interface PaymentState {
  selectedMethod: PaymentMethod | null;
  splitPayments: PaymentRecord[];
  cashDetails: CashPaymentDetails | null;
  cardDetails: CardPaymentDetails | null;
  qrisDetails: QRISPaymentDetails | null;
}

// Complete transaction
export interface Transaction {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  tableId: string | null;
  items: CartItemSummary[];
  subtotal: number;
  taxes: { code: string; rate: number; amount: number }[];
  discount: { code: string; name: string; amount: number } | null;
  total: number;
  payments: PaymentRecord[];
  cashierName: string;
  createdAt: string;
  completedAt: string;
}

// Cart item summary for receipt
export interface CartItemSummary {
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: { name: string; price: number }[];
  itemTotal: number;
}

// Import OrderType from cart
import type { OrderType } from './cart';
import type { CartItem } from './product';
