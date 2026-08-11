import {
  ShoppingCart,
  Percent,
  Tag,
  Receipt,
  Loader2,
  MinusCircle,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { Button, Badge } from '../../ui';
import { useSimpleCart } from '../../../hooks';
import type { OrderItem } from '../../../api/order-items';

interface OrderSummaryProps {
  onCheckout?: () => void;
  onApplyDiscount?: () => void;
}

export function OrderSummary({ onCheckout, onApplyDiscount }: OrderSummaryProps) {
  // Get data from backend directly
  const {
    items,
    calculation,
    isLoading,
    updateItem,
    removeItem,
    removeDiscount,
    hasOrder,
    order,
  } = useSimpleCart();

  // Handle quantity update
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem({ itemId, quantity: newQuantity });
  };

  // Handle remove item
  const handleRemoveItem = async (itemId: string) => {
    removeItem(itemId);
  };

  // Handle remove discount
  const handleRemoveDiscount = () => {
    removeDiscount();
  };

  // Empty state
  if (!hasOrder || items.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Ringkasan Order
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500">Order belum dibuat</p>
            <p className="text-xs text-slate-400 mt-1">Pilih menu untuk memulai</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate from backend calculation
  const subtotal = calculation?.subtotal ?? order?.subtotal ?? 0;
  const taxAmount = calculation?.taxAmount ?? order?.taxAmount ?? 0;
  const discountAmount = (calculation as any)?.orderDiscountAmount ?? order?.discountAmount ?? 0;
  const discountName = (calculation as any)?.appliedDiscountName ?? null;
  const totalAmount = calculation?.totalAmount ?? order?.totalAmount ?? subtotal + taxAmount - discountAmount;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Ringkasan Order
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {items.length} item • {order?.orderNumber || 'Draft'}
            </p>
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Calculation Summary */}
      <div className="border-t border-slate-200">
        {/* Subtotal */}
        <div className="px-4 py-2 flex justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="text-slate-900 font-medium">
            Rp {subtotal.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Discount */}
        {discountName && discountAmount > 0 && (
          <div className="px-4 py-1 flex justify-between text-sm text-green-600">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {discountName}
            </span>
            <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
          </div>
        )}

        {/* Discount Section */}
        <div className="px-4 py-2">
          {discountName ? (
            <div className="flex items-center justify-between">
              <Badge variant="success" className="flex items-center gap-1">
                <Percent className="w-3 h-3" />
                {discountName}
              </Badge>
              <button
                onClick={handleRemoveDiscount}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Hapus
              </button>
            </div>
          ) : (
            <button
              onClick={onApplyDiscount}
              className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-amber-400 hover:text-amber-600 transition-colors"
            >
              + Tambah Diskon
            </button>
          )}
        </div>

        {/* Tax */}
        {taxAmount > 0 && (
          <div className="px-4 py-1 flex justify-between text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <Receipt className="w-3 h-3" />
              PPN (11%)
            </span>
            <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
          </div>
        )}

        {/* Grand Total */}
        <div className="px-4 py-3 bg-amber-50">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-slate-900">Total</span>
            <span className="text-xl font-bold text-amber-600">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Footer - Checkout Button */}
      {hasOrder && items.length > 0 && (
        <div className="p-4 border-t border-t-slate-100 bg-slate-50">
          <Button
            className="w-full"
            size="lg"
            onClick={onCheckout}
          >
            Bayar Sekarang
          </Button>
        </div>
      )}
    </div>
  );
}

// Cart Item Row Component
interface CartItemRowProps {
  item: OrderItem;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const displayName = item.productName || item.variantName || 'Item';
  const modifierText = item.modifiers?.map(m => m.modifierName).join(', ') || null;

  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Product Name */}
          <p className="text-sm font-medium text-slate-900 truncate">
            {displayName}
          </p>

          {/* Modifiers */}
          {modifierText && (
            <p className="text-xs text-blue-600 truncate">{modifierText}</p>
          )}

          {/* Unit Price */}
          <p className="text-xs text-slate-500 mt-0.5">
            Rp {Number(item.unitPrice).toLocaleString('id-ID')}
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.id)}
          className="p-1 hover:bg-red-50 rounded text-red-500 flex-shrink-0"
          title="Hapus item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1 py-0.5">
          <button
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-1 hover:bg-slate-100 rounded disabled:opacity-40"
          >
            <MinusCircle className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-sm font-medium w-8 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <PlusCircle className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Item Total */}
        <p className="text-sm font-semibold text-slate-900">
          Rp {Number(item.subtotal).toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  );
}
