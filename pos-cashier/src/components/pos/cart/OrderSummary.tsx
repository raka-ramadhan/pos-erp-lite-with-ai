import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ShoppingCart, Percent, Tag, Receipt, Loader2, UtensilsCrossed, MinusCircle, PlusCircle, Trash2, AlertCircle, CheckCircle, CloudOff } from 'lucide-react';
import { Button, Badge } from '../../ui';
import { useOrderCalculation, useApplyDiscount, useRemoveDiscount, useUpdateCartItem, useRemoveFromCart } from '../../../hooks';
import type { RootState } from '../../../store';
import type { Discount } from '../../../api/discounts';
import type { SyncedCartItem, SyncStatus } from '../../../types';

interface OrderSummaryProps {
  onCheckout?: () => void;
  onApplyDiscount?: () => void;
}

// Sync status indicator component
function SyncStatusBadge({ status }: { status: SyncStatus }) {
  if (status === 'synced') return null;

  const config = {
    pending: { icon: Loader2, color: 'text-slate-400', label: 'Menyimpan...', animate: true },
    syncing: { icon: Loader2, color: 'text-amber-400', label: 'Sync...', animate: true },
    failed: { icon: CloudOff, color: 'text-red-500', label: 'Gagal sync', animate: false },
  };

  const { icon: Icon, color, label, animate } = config[status];

  return (
    <span className={`flex items-center gap-1 text-xs ${color}`}>
      <Icon className={`w-3 h-3 ${animate ? 'animate-spin' : ''}`} />
      {label}
    </span>
  );
}

export function OrderSummary({ onCheckout, onApplyDiscount }: OrderSummaryProps) {
  const posState = useSelector((state: RootState) => state.pos);
  const orderId = posState.currentOrder?.id || null;

  // Fetch order calculation from backend (source of truth for totals)
  const { data: calculation, isLoading: calculationLoading } = useOrderCalculation(orderId);

  // Optimistic mutations
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const applyDiscountMutation = useApplyDiscount(orderId);
  const removeDiscountMutation = useRemoveDiscount(orderId);

  // Get synced cart items from Redux
  const syncedItems = posState.syncedCartItems;
  const syncStatus = posState.syncStatus;

  // Use backend data if available, fallback to synced cart
  const items = syncedItems.length > 0 ? syncedItems : [];
  const itemCount = items.length;

  // Calculate local subtotal (for immediate display)
  const localSubtotal = items.reduce((sum, item) => sum + Number(item.itemTotal), 0);

  // Handle quantity update
  const handleQuantityChange = async (tempId: string, serverId: string | undefined, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItemMutation.mutateAsync({
        tempId,
        serverId,
        quantity: newQuantity,
      });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (tempId: string, serverId: string | undefined) => {
    try {
      await removeFromCartMutation.mutateAsync({
        tempId,
        serverId,
      });
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  // Handle apply discount
  const handleApplyDiscount = (discount: Discount) => {
    if (!orderId) return;
    applyDiscountMutation.mutate(discount.id);
  };

  // Handle remove discount
  const handleRemoveDiscount = () => {
    if (!orderId) return;
    removeDiscountMutation.mutate();
  };

  // Empty state - no order yet
  if (!orderId && syncedItems.length === 0) {
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

  // Use local calculation for immediate display (optimistic)
  // Backend calculation is source of truth for discount/tax but may be stale for subtotal
  const displaySubtotal = localSubtotal;
  const hasDiscountApplied = calculation?.appliedDiscountId != null;
  const discountAmount = calculation?.orderDiscountAmount ?? 0;
  const taxAmount = calculation?.taxAmount ?? 0;
  const displayTotal = localSubtotal - discountAmount + taxAmount;

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
              {itemCount} item • {posState.currentOrder?.orderNumber || 'Draft'}
            </p>
          </div>
          {/* Sync Status */}
          <SyncStatusBadge status={syncStatus} />
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto">
        {itemCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <ShoppingCart className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 text-center">Belum ada item</p>
            <p className="text-xs text-slate-400 mt-1 text-center">
              Ketuk menu untuk menambahkan
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {items.map((item) => (
              <div
                key={item.tempId}
                className="bg-slate-50 rounded-xl p-3 border border-slate-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.productName || item.variantName || 'Item'}
                      </p>
                      {item.syncStatus !== 'synced' && (
                        <SyncStatusBadge status={item.syncStatus} />
                      )}
                    </div>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <p className="text-xs text-blue-600 truncate">
                        {item.modifiers.map(m => m.name).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rp {Number(item.basePrice).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.tempId, item.serverId)}
                    disabled={removeFromCartMutation.isPending}
                    className="p-1 hover:bg-red-50 rounded text-red-500 disabled:opacity-40 flex-shrink-0"
                    title="Hapus item"
                  >
                    {removeFromCartMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1 py-0.5">
                    <button
                      onClick={() => handleQuantityChange(item.tempId, item.serverId, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updateCartItemMutation.isPending}
                      className="p-1 hover:bg-slate-100 rounded disabled:opacity-40"
                    >
                      <MinusCircle className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.tempId, item.serverId, item.quantity + 1)}
                      disabled={updateCartItemMutation.isPending}
                      className="p-1 hover:bg-slate-100 rounded disabled:opacity-40"
                    >
                      <PlusCircle className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    Rp {Number(item.itemTotal).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calculation Summary */}
      <div className="border-t border-slate-200">
        {calculationLoading && syncedItems.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Subtotal */}
            <div className="px-4 py-2 flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="text-slate-900 font-medium">
                Rp {displaySubtotal.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Product Discount (if any) */}
            {calculation && calculation.productDiscountTotal > 0 && (
              <div className="px-4 py-1 flex justify-between text-sm text-green-600">
                <span>Product Discount</span>
                <span>-Rp {calculation.productDiscountTotal.toLocaleString('id-ID')}</span>
              </div>
            )}

            {/* Order Discount */}
            {hasDiscountApplied && (
              <div className="px-4 py-1 flex justify-between text-sm text-green-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {calculation?.appliedDiscountName}
                </span>
                <span>-Rp {(calculation?.orderDiscountAmount || 0).toLocaleString('id-ID')}</span>
              </div>
            )}

            {/* Discount Section */}
            <div className="px-4 py-2">
              {hasDiscountApplied ? (
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    {calculation?.appliedDiscountName}
                  </Badge>
                  <button
                    onClick={handleRemoveDiscount}
                    disabled={removeDiscountMutation.isPending}
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

            {/* Tax Section */}
            {calculation && calculation.taxAmount > 0 && (
              <div className="px-4 py-1 flex justify-between text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Receipt className="w-3 h-3" />
                  PPN (11%)
                </span>
                <span>Rp {calculation.taxAmount.toLocaleString('id-ID')}</span>
              </div>
            )}

            {/* Grand Total */}
            <div className="px-4 py-3 bg-amber-50">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-slate-900">Total</span>
                <span className="text-xl font-bold text-amber-600">
                  Rp {displayTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer - Checkout Button */}
      {itemCount > 0 && orderId && (
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
