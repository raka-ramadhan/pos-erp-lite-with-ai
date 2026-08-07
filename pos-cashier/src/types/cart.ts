// Order type enum
export enum OrderType {
  DINE_IN_TABLE = 'dine_in_with_table',
  DINE_IN_QUICK = 'dine_in_quick_service',
  TAKEAWAY = 'takeaway',
}

// Order type display configuration
export const ORDER_TYPE_CONFIG: Record<
  OrderType,
  {
    label: string;
    description: string;
    icon: string;
    color: string;
    bgColor: string;
    hoverBgColor: string;
    requiresTable: boolean;
  }
> = {
  [OrderType.DINE_IN_TABLE]: {
    label: 'Dine In',
    description: 'Makan di tempat dengan meja',
    icon: 'UtensilsCrossed',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    hoverBgColor: 'hover:bg-amber-100',
    requiresTable: true,
  },
  [OrderType.DINE_IN_QUICK]: {
    label: 'Quick Service',
    description: 'Makan di tempat tanpa meja',
    icon: 'Coffee',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    hoverBgColor: 'hover:bg-orange-100',
    requiresTable: false,
  },
  [OrderType.TAKEAWAY]: {
    label: 'Takeaway',
    description: 'Bawa pulang',
    icon: 'ShoppingBag',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    hoverBgColor: 'hover:bg-blue-100',
    requiresTable: false,
  },
};

// Customer type
export type CustomerType = 'walk_in' | 'member' | 'reservation';

// Order status (for future use)
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'refunded';

// Order summary for display
export interface OrderSummary {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  tableId: string | null;
  tableName: string | null;
  customerName: string;
  customerType: CustomerType;
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  cashierName: string;
  createdAt: string;
}
