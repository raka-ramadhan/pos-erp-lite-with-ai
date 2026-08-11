import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  ArrowLeft,
  FileText,
  Printer,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui';
import { Badge } from '../../components/ui';
import { Card } from '../../components/ui';
import { useTransactionDetail } from '../../hooks';
import { ReceiptPreview } from '../../components/pos/history/ReceiptPreview';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "dd MMMM yyyy • HH:mm:ss", { locale: id });
}

function getOrderTypeLabel(orderType: string): string {
  switch (orderType) {
    case 'dine_in':
      return 'Dine In';
    case 'take_away':
      return 'Take Away';
    case 'delivery':
      return 'Delivery';
    default:
      return orderType;
  }
}

export function TransactionDetailPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const [showReceipt, setShowReceipt] = useState(false);

  // Fetch transaction detail
  const { data: transaction, isLoading, isError, error } = useTransactionDetail(transactionId || '');

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle receipt close
  const handleReceiptClose = () => {
    setShowReceipt(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Memuat detail transaksi...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Gagal Memuat</h2>
          <p className="text-sm text-slate-500 mb-4">
            {error instanceof Error ? error.message : 'Terjadi kesalahan'}
          </p>
          <Button onClick={() => navigate('/pos/history')}>
            Kembali ke Riwayat
          </Button>
        </Card>
      </div>
    );
  }

  // Transaction not found
  if (!transaction) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center p-6">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Transaksi Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mb-4">
            Transaksi yang dicari tidak dapat ditemukan.
          </p>
          <Button onClick={() => navigate('/pos/history')}>
            Kembali ke Riwayat
          </Button>
        </Card>
      </div>
    );
  }

  const primaryPayment = transaction.payments[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/pos/history')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Detail Transaksi</h1>
                <Badge variant="success" className="mt-1">COMPLETED</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Transaction Info Card */}
        <Card>
          <div className="p-4">
            <p className="font-mono font-bold text-lg text-slate-900">
              {transaction.transactionNumber}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {formatDateTime(transaction.completedAt)}
            </p>
          </div>
        </Card>

        {/* Order Info Card */}
        <Card>
          <div className="p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Info Order</h3>
            <div className="flex justify-between">
              <span className="text-slate-500">Kasir:</span>
              <span className="font-medium">{transaction.cashierName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tipe Order:</span>
              <Badge variant="success">{getOrderTypeLabel(transaction.orderType)}</Badge>
            </div>
            {transaction.orderType === 'dine_in' && transaction.tableName && (
              <div className="flex justify-between">
                <span className="text-slate-500">Meja:</span>
                <span className="font-medium">{transaction.tableName}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Items Card */}
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Item Pesanan</h3>
            <div className="space-y-3">
              {transaction.items.map((item) => (
                <div key={item.id} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {item.quantity}x {item.productName}
                      </p>
                      {item.variantName && (
                        <p className="text-sm text-slate-500">{item.variantName}</p>
                      )}
                    </div>
                    <p className="font-medium text-slate-900 ml-4">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>

                  {/* Modifiers */}
                  {item.modifiers.length > 0 && (
                    <div className="mt-2 ml-4 space-y-1">
                      {item.modifiers.map((mod) => (
                        <p key={mod.id} className="text-sm text-slate-500 flex items-center gap-1">
                          <span className="w-1 h-1 bg-slate-400 rounded-full" />
                          {mod.modifierName}
                          {mod.unitPrice > 0 && ` (+${formatCurrency(mod.unitPrice)})`}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Item Notes */}
                  {item.notes && (
                    <div className="mt-2 ml-4">
                      <p className="text-sm text-amber-600">
                        Catatan: {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Price Breakdown Card */}
        <Card>
          <div className="p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span>{formatCurrency(transaction.subtotal)}</span>
            </div>
            {transaction.discount.discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Diskon{transaction.discount.discountName && ` (${transaction.discount.discountName})`}</span>
                <span>-{formatCurrency(transaction.discount.discountAmount)}</span>
              </div>
            )}
            {transaction.tax.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Pajak{transaction.tax.taxName && ` (${transaction.tax.taxName})`}
                </span>
                <span>{formatCurrency(transaction.tax.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-lg font-bold text-amber-600">
                {formatCurrency(transaction.totalAmount)}
              </span>
            </div>
          </div>
        </Card>

        {/* Payment Info Card */}
        {primaryPayment && (
          <Card>
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Pembayaran</h3>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode</span>
                <span className="font-medium">{primaryPayment.paymentMethodName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Tagihan</span>
                <span>{formatCurrency(primaryPayment.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dibayar</span>
                <span>{formatCurrency(primaryPayment.amount)}</span>
              </div>
              {primaryPayment.changeAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Kembalian</span>
                  <span className="font-medium">{formatCurrency(primaryPayment.changeAmount)}</span>
                </div>
              )}
              {primaryPayment.referenceNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference</span>
                  <span className="text-sm font-mono">{primaryPayment.referenceNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2 mt-2 border-t border-slate-200">
                <span className="flex items-center gap-1 text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  PAID
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-sm text-slate-500">
                  {format(new Date(primaryPayment.paidAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Notes Card */}
        {transaction.notes && (
          <Card className="bg-amber-50 border-amber-200">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-amber-700 mb-2">Catatan Order</h3>
              <p className="text-sm text-amber-700">{transaction.notes}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 z-10">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => setShowReceipt(true)}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Lihat Struk
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Cetak Ulang
          </Button>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      <ReceiptPreview
        transaction={transaction}
        isOpen={showReceipt}
        onClose={handleReceiptClose}
        onPrint={handlePrint}
      />
    </div>
  );
}

export default TransactionDetailPage;
