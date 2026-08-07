import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  MapPin,
  Clock,
  ShoppingCart,
  Users,
  MinusCircle,
  PlusCircle,
  Trash2,
  AlertCircle,
  Loader2,
  MessageSquare,
  Check,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input } from '../../components/ui';
import {
  useOrderWithItems,
  useUpdateOrderItem,
  useUpdateOrderItemNotes,
  useRemoveOrderItem,
  useOrderCalculation,
} from '../../hooks';
import { cn } from '../../utils';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { RootState } from '../../store';

// Order type config
const ORDER_TYPE_CONFIG = {
  dine_in: { icon: UtensilsCrossed, label: 'Dine In', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  take_away: { icon: ShoppingBag, label: 'Takeaway', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  delivery: { icon: Truck, label: 'Delivery', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
};

// Status config
const STATUS_CONFIG = {
  open: { label: 'Open', color: 'text-blue-600', bgColor: 'bg-blue-100', dotColor: 'bg-blue-500' },
  in_progress: { label: 'Diproses', color: 'text-amber-600', bgColor: 'bg-amber-100', dotColor: 'bg-amber-500' },
  completed: { label: 'Selesai', color: 'text-green-600', bgColor: 'bg-green-100', dotColor: 'bg-green-500' },
  cancelled: { label: 'Batal', color: 'text-red-600', bgColor: 'bg-red-100', dotColor: 'bg-red-500' },
};

export function OrderSessionPage() {
  useDocumentTitle('Order Session - POS');
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const posState = useSelector((state: RootState) => state.pos);

  // Fetch order with items from backend
  const { data: orderWithItems, isLoading, error, refetch } = useOrderWithItems(orderId!);

  // Fetch calculation from backend (single source of truth)
  const { data: calculation } = useOrderCalculation(orderId!);

  // Mutations
  const updateItemMutation = useUpdateOrderItem(orderId!);
  const updateNotesMutation = useUpdateOrderItemNotes(orderId!);
  const removeItemMutation = useRemoveOrderItem(orderId!);

  // Local state for notes editing
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  // Use backend order if available, fallback to Redux state
  const order = orderWithItems?.order;
  const items = orderWithItems?.items || [];

  // Use backend calculation (single source of truth)
  const subtotal = calculation?.subtotal ?? order?.subtotal ?? 0;
  const taxAmount = calculation?.taxAmount ?? order?.taxAmount ?? 0;
  const discountAmount = calculation?.orderDiscountAmount ?? order?.discountAmount ?? 0;
  const total = calculation?.totalAmount ?? order?.totalAmount ?? 0;

  // Handle quantity update
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateItemMutation.mutateAsync({
        itemId,
        payload: { quantity: newQuantity },
      });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (itemId: string) => {
    setRemovingItemId(itemId);
    try {
      await removeItemMutation.mutateAsync(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setRemovingItemId(null);
    }
  };

  // Handle notes editing
  const handleStartNotes = (itemId: string, currentNotes: string | null) => {
    setEditingNotesId(itemId);
    setNotesText(currentNotes || '');
  };

  const handleSaveNotes = async (itemId: string) => {
    try {
      await updateNotesMutation.mutateAsync({ itemId, notes: notesText });
      setEditingNotesId(null);
      setNotesText('');
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  };

  const handleCancelNotes = () => {
    setEditingNotesId(null);
    setNotesText('');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Memuat data order...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center">
          <CardBody className="pt-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Order Tidak Ditemukan</h2>
            <p className="text-sm text-slate-500 mb-4">
              Order dengan ID tersebut tidak dapat ditemukan.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => navigate('/pos')}>
                Kembali
              </Button>
              <Button size="sm" onClick={() => refetch()}>
                Coba Lagi
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const typeConfig = ORDER_TYPE_CONFIG[order.orderType as keyof typeof ORDER_TYPE_CONFIG] || ORDER_TYPE_CONFIG.dine_in;
  const status = STATUS_CONFIG[order.orderStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.open;
  const TypeIcon = typeConfig.icon;

  // Check if order is editable
  const canEdit = order.orderStatus === 'open' || order.orderStatus === 'in_progress';

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/pos')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900">
                    Order #{order.orderNumber}
                  </h1>
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
                    status.bgColor,
                    status.color
                  )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', status.dotColor)} />
                    {status.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {order.table ? `Meja ${order.table.tableName}` : typeConfig.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Order Type Badge */}
          <div className="mb-4">
            <div className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              typeConfig.bgColor,
              typeConfig.color
            )}>
              <TypeIcon className="w-4 h-4" />
              {typeConfig.label}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {/* Order Number */}
            <div className="bg-white rounded-xl p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Order</p>
              <p className="text-sm font-semibold text-slate-900 font-mono">
                #{order.orderNumber}
              </p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Meja</p>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {order.table?.tableName || '-'}
              </p>
            </div>

            {/* Customers */}
            <div className="bg-white rounded-xl p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Pelanggan</p>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {order.customerCount || 1} orang
              </p>
            </div>

            {/* Time */}
            <div className="bg-white rounded-xl p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Waktu</p>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(order.orderedAt || order.createdAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Cart Section */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Cart Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-slate-600" />
                  <h2 className="font-semibold text-slate-900">Item Pesanan</h2>
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 mb-1">Belum ada item</p>
                  <p className="text-xs text-slate-400">
                    Klik tombol di bawah untuk memilih menu
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-slate-900 truncate">
                          {item.productName || item.variantName || 'Item'}
                        </h3>
                        {item.variantName && item.productName && (
                          <p className="text-xs text-blue-600 mt-0.5">
                            {item.variantName}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5">
                          Rp {Number(item.unitPrice).toLocaleString('id-ID')}
                        </p>

                        {/* Notes Section */}
                        {editingNotesId === item.id ? (
                          <div className="mt-2">
                            <div className="flex gap-2">
                              <Input
                                value={notesText}
                                onChange={(e) => setNotesText(e.target.value)}
                                placeholder="Tambahkan catatan..."
                                className="text-xs"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSaveNotes(item.id)}
                                disabled={updateNotesMutation.isPending}
                                className="p-1"
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelNotes}
                                className="p-1"
                              >
                                <X className="w-4 h-4 text-slate-400" />
                              </Button>
                            </div>
                          </div>
                        ) : item.notes ? (
                          <button
                            onClick={() => handleStartNotes(item.id, item.notes)}
                            className="mt-1.5 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
                          >
                            <MessageSquare className="w-3 h-3" />
                            {item.notes}
                          </button>
                        ) : (
                          canEdit && (
                            <button
                              onClick={() => handleStartNotes(item.id, null)}
                              className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Tambah catatan
                            </button>
                          )
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quantity Controls */}
                        {canEdit && (
                          <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-1.5 py-0.5">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updateItemMutation.isPending}
                              className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-40"
                            >
                              <MinusCircle className="w-4 h-4 text-slate-600" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={updateItemMutation.isPending}
                              className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-40"
                            >
                              <PlusCircle className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                        )}

                        {/* Price */}
                        <p className="text-sm font-semibold text-slate-900 w-20 text-right">
                          Rp {Number(item.subtotal).toLocaleString('id-ID')}
                        </p>

                        {/* Remove Button */}
                        {canEdit && (
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removingItemId === item.id || removeItemMutation.isPending}
                            className="p-1 hover:bg-red-50 rounded text-red-500 disabled:opacity-40"
                          >
                            {removingItemId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pajak (11%)</span>
                <span className="text-slate-900">Rp {taxAmount.toLocaleString('id-ID')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Diskon</span>
                  <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-lg text-amber-600">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/pos')}
          >
            Batal
          </Button>
          <Button
            className="flex-1 bg-amber-600 hover:bg-amber-700"
            onClick={() => navigate('/pos/products')}
          >
            <span>Pilih Menu</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OrderSessionPage;
