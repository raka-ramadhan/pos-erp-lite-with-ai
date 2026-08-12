import { FileText, Receipt, User, MapPin, Clock, CreditCard } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ReceiptPreview } from './ReceiptPreview';
import { useTransactionDetail } from '../../hooks/useTransactions';
import type { OrderType } from '../../api/transactions.api';

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Order type badge
function getOrderTypeBadge(type: OrderType) {
  switch (type) {
    case 'dine_in':
      return { variant: 'info' as const, label: 'Dine In' };
    case 'take_away':
      return { variant: 'secondary' as const, label: 'Take Away' };
    case 'delivery':
      return { variant: 'warning' as const, label: 'Delivery' };
    default:
      return { variant: 'default' as const, label: type };
  }
}

// Payment status badge
function getPaymentStatusBadge(status: 'pending' | 'completed' | 'failed' | 'refunded') {
  switch (status) {
    case 'completed':
      return { variant: 'success' as const, label: 'Completed' };
    case 'pending':
      return { variant: 'warning' as const, label: 'Pending' };
    case 'failed':
      return { variant: 'danger' as const, label: 'Failed' };
    case 'refunded':
      return { variant: 'info' as const, label: 'Refunded' };
    default:
      return { variant: 'default' as const, label: status };
  }
}

interface TransactionDetailDrawerProps {
  transactionId: string | null;
  onClose: () => void;
}

export function TransactionDetailDrawer({ transactionId, onClose }: TransactionDetailDrawerProps) {
  const { data: transaction, isLoading, error } = useTransactionDetail(transactionId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Drawer
      isOpen={!!transactionId}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Transaction Details
            </h2>
            {transaction && (
              <p className="text-sm text-slate-500 font-mono">
                {transaction.transactionNumber}
              </p>
            )}
          </div>
        </div>
      }
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load transaction details</p>
        </div>
      ) : transaction ? (
        <div className="space-y-6">
          {/* Transaction Info */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Badge variant={getOrderTypeBadge(transaction.orderType).variant}>
                {getOrderTypeBadge(transaction.orderType).label}
              </Badge>
              {transaction.payments.length > 0 && (
                <Badge variant={getPaymentStatusBadge(transaction.payments[0].status).variant}>
                  {getPaymentStatusBadge(transaction.payments[0].status).label}
                </Badge>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {transaction.orderNumber && (
                <div>
                  <p className="text-slate-500">Order Number</p>
                  <p className="font-medium text-slate-900 font-mono">{transaction.orderNumber}</p>
                </div>
              )}
              {transaction.tableName && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-slate-500">Table</p>
                    <p className="font-medium text-slate-900">
                      {transaction.tableName}
                      {transaction.tableCode && ` (${transaction.tableCode})`}
                    </p>
                  </div>
                </div>
              )}
              {transaction.cashierName && (
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-slate-500">Cashier</p>
                    <p className="font-medium text-slate-900">{transaction.cashierName}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-500">Date & Time</p>
                  <p className="font-medium text-slate-900">
                    {formatDate(transaction.completedAt || transaction.orderedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Items</h3>
            <div className="space-y-3">
              {transaction.items.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-sm text-slate-500">{item.variantName}</p>
                      )}
                      <p className="text-sm text-slate-600 mt-1">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>

                      {/* Modifiers */}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="mt-2 pl-3 border-l-2 border-slate-200 space-y-1">
                          {item.modifiers.map((mod) => (
                            <p key={mod.id} className="text-sm text-slate-500">
                              {mod.modifierName}
                              {mod.quantity > 1 && ` ×${mod.quantity}`}
                              <span className="text-slate-400 ml-2">
                                {mod.unitPrice > 0 && `+${formatCurrency(mod.unitPrice)}`}
                              </span>
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Item Notes */}
                      {item.notes && (
                        <p className="text-sm text-slate-400 italic mt-1">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    <p className="font-medium text-slate-900">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="text-slate-900">{formatCurrency(transaction.subtotal)}</span>
            </div>

            {transaction.discount.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Discount
                  {transaction.discount.discountName && (
                    <span className="text-slate-400"> ({transaction.discount.discountName})</span>
                  )}
                </span>
                <span className="text-green-600">
                  -{formatCurrency(transaction.discount.discountAmount)}
                </span>
              </div>
            )}

            {transaction.tax.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {transaction.tax.taxName || 'Tax'}
                  {transaction.tax.taxRate && (
                    <span className="text-slate-400"> ({transaction.tax.taxRate}%)</span>
                  )}
                </span>
                <span className="text-slate-900">
                  +{formatCurrency(transaction.tax.taxAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between font-semibold text-lg pt-2 border-t border-slate-200">
              <span className="text-slate-900">Total</span>
              <span className="text-indigo-600">{formatCurrency(transaction.totalAmount)}</span>
            </div>
          </div>

          {/* Payment */}
          {transaction.payments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Payment</h3>
              <div className="space-y-3">
                {transaction.payments.map((payment) => (
                  <div key={payment.id} className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-slate-900">
                              {payment.paymentMethodName}
                            </p>
                            <p className="text-sm text-slate-500">
                              {payment.paymentType}
                              {payment.provider && ` - ${payment.provider}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              {formatCurrency(payment.amount)}
                            </p>
                            <Badge variant={getPaymentStatusBadge(payment.status).variant} size="sm">
                              {getPaymentStatusBadge(payment.status).label}
                            </Badge>
                          </div>
                        </div>

                        {payment.referenceNumber && (
                          <p className="text-sm text-slate-500 mt-2">
                            Ref: {payment.referenceNumber}
                          </p>
                        )}

                        {payment.cardNumber && (
                          <p className="text-sm text-slate-500">
                            Card: **** {payment.cardNumber}
                          </p>
                        )}

                        {payment.changeAmount > 0 && (
                          <p className="text-sm text-slate-500 mt-1">
                            Change: {formatCurrency(payment.changeAmount)}
                          </p>
                        )}

                        <p className="text-xs text-slate-400 mt-2">
                          Paid at: {formatDate(payment.paidAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {transaction.notes && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Notes</h3>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                {transaction.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Receipt className="w-4 h-4" />}
              onClick={handlePrint}
              className="flex-1"
            >
              Print Receipt
            </Button>
          </div>

          {/* Receipt Preview (hidden, for printing) */}
          <div className="hidden print:block">
            <ReceiptPreview transaction={transaction} />
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}
