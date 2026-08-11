import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { X, Printer } from 'lucide-react';
import type { TransactionDetail } from '../../../api/transactions';

interface ReceiptPreviewProps {
  transaction: TransactionDetail;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ReceiptPreview({ transaction, isOpen, onClose, onPrint }: ReceiptPreviewProps) {
  if (!isOpen) return null;

  const completedDate = new Date(transaction.completedAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-sm mx-4 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
          <h2 className="font-semibold">Preview Struk</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content - 80mm thermal printer style */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          <div className="bg-white border border-dashed border-slate-300 p-4 mx-auto" style={{ width: '280px' }}>
            {/* Restaurant Header */}
            <div className="text-center mb-4">
              <h3 className="font-bold text-lg">NAMA RESTORAN</h3>
              <p className="text-xs text-slate-500">Alamat Restoran</p>
              <p className="text-xs text-slate-500">Telepon: 0812-3456-7890</p>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-400 my-3" />

            {/* Transaction Info */}
            <div className="text-center text-sm mb-3">
              <p className="font-bold">{transaction.transactionNumber}</p>
              <p className="text-xs text-slate-500">
                {format(completedDate, "dd/MM/yyyy • HH:mm:ss", { locale: id })}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-400 my-3" />

            {/* Order Type & Table */}
            <div className="text-sm mb-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Tipe Order:</span>
                <span className="font-medium">
                  {transaction.orderType === 'dine_in' && 'Dine In'}
                  {transaction.orderType === 'take_away' && 'Take Away'}
                  {transaction.orderType === 'delivery' && 'Delivery'}
                </span>
              </div>
              {transaction.tableName && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Meja:</span>
                  <span className="font-medium">{transaction.tableName}</span>
                </div>
              )}
              {transaction.cashierName && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Kasir:</span>
                  <span className="font-medium">{transaction.cashierName}</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-400 my-3" />

            {/* Items */}
            <div className="text-sm space-y-2 mb-3">
              <p className="font-semibold">Item Pesanan:</p>
              {transaction.items.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between">
                    <span>{item.quantity}x {item.productName}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                  {item.variantName && (
                    <p className="text-xs text-slate-500 ml-4">{item.variantName}</p>
                  )}
                  {item.modifiers.length > 0 && (
                    <div className="ml-4 space-y-0.5">
                      {item.modifiers.map((mod) => (
                        <p key={mod.id} className="text-xs text-slate-500">
                          • {mod.modifierName}
                          {mod.unitPrice > 0 && ` (+${formatCurrency(mod.unitPrice)})`}
                        </p>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <p className="text-xs text-amber-600 ml-4">
                      Catatan: {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-400 my-3" />

            {/* Price Breakdown */}
            <div className="text-sm space-y-1 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span>{formatCurrency(transaction.subtotal)}</span>
              </div>
              {transaction.discount.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon{transaction.discount.discountName && ` (${transaction.discount.discountName})`}:</span>
                  <span>-{formatCurrency(transaction.discount.discountAmount)}</span>
                </div>
              )}
              {transaction.tax.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Pajak{transaction.tax.taxName && ` (${transaction.tax.taxName})`}:
                  </span>
                  <span>{formatCurrency(transaction.tax.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1 border-t border-slate-300">
                <span>TOTAL:</span>
                <span>{formatCurrency(transaction.totalAmount)}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-400 my-3" />

            {/* Payment Info */}
            <div className="text-sm space-y-1 mb-3">
              <p className="font-semibold">Pembayaran:</p>
              {transaction.payments.map((payment) => (
                <div key={payment.id}>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Metode:</span>
                    <span>{payment.paymentMethodName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Tagihan:</span>
                    <span>{formatCurrency(payment.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Dibayar:</span>
                    <span>{formatCurrency(payment.amount)}</span>
                  </div>
                  {payment.changeAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Kembalian:</span>
                      <span>{formatCurrency(payment.changeAmount)}</span>
                    </div>
                  )}
                  {payment.referenceNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Reference:</span>
                      <span className="text-xs">{payment.referenceNumber}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-400 my-3" />

            {/* Thank You Message */}
            <div className="text-center text-sm">
              <p className="font-medium">Terima Kasih!</p>
              <p className="text-xs text-slate-500">Semoga datang lagi</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3 p-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border-2 border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={onPrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak
          </button>
        </div>
      </div>
    </div>
  );
}
