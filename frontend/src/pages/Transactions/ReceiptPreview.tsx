import type { TransactionDetail } from '../../api/transactions.api';

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
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Format time
function formatTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ReceiptPreviewProps {
  transaction: TransactionDetail;
}

export function ReceiptPreview({ transaction }: ReceiptPreviewProps) {
  // Order type display
  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case 'dine_in':
        return 'DINE IN';
      case 'take_away':
        return 'TAKE AWAY';
      case 'delivery':
        return 'DELIVERY';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="receipt-container p-4 bg-white text-black" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">NEXUS RESTAURANT</h1>
        <p className="text-xs text-gray-600">Restaurant POS System</p>
      </div>

      {/* Divider */}
      <div className="border-t border-b border-dashed border-gray-400 py-2 mb-4">
        <div className="flex justify-between text-xs">
          <span>Order: {transaction.transactionNumber}</span>
          <span>{formatDate(transaction.completedAt || transaction.orderedAt)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Kasir: {transaction.cashierName || '-'}</span>
          <span>{formatTime(transaction.completedAt || transaction.orderedAt)}</span>
        </div>
      </div>

      {/* Order Type & Table */}
      <div className="text-center mb-4">
        <span className="font-bold text-sm">{getOrderTypeLabel(transaction.orderType)}</span>
        {transaction.tableName && (
          <span className="ml-2 text-sm">Table: {transaction.tableName}</span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-400 mb-4" />

      {/* Items */}
      <div className="space-y-2 mb-4">
        {transaction.items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between">
              <div className="flex-1">
                <span className="font-medium">{item.productName}</span>
                <span className="ml-2 text-gray-600">
                  ×{item.quantity} × {formatCurrency(item.unitPrice)}
                </span>
              </div>
              <span className="font-medium">{formatCurrency(item.subtotal)}</span>
            </div>

            {/* Modifiers */}
            {item.modifiers && item.modifiers.length > 0 && (
              <div className="pl-4 text-xs text-gray-600 space-y-0.5">
                {item.modifiers.map((mod) => (
                  <div key={mod.id} className="flex justify-between">
                    <span>
                      {mod.modifierName}
                      {mod.quantity > 1 && ` ×${mod.quantity}`}
                    </span>
                    {mod.unitPrice > 0 && (
                      <span>+{formatCurrency(mod.unitPrice)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-400 mb-4" />

      {/* Summary */}
      <div className="space-y-1 text-xs mb-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(transaction.subtotal)}</span>
        </div>

        {transaction.discount.discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>
              Discount
              {transaction.discount.discountName && (
                <span className="text-gray-500"> ({transaction.discount.discountName})</span>
              )}
            </span>
            <span>-{formatCurrency(transaction.discount.discountAmount)}</span>
          </div>
        )}

        {transaction.tax.taxAmount > 0 && (
          <div className="flex justify-between">
            <span>
              {transaction.tax.taxName || 'Tax'}
              {transaction.tax.taxRate && (
                <span className="text-gray-500"> ({transaction.tax.taxRate}%)</span>
              )}
            </span>
            <span>+{formatCurrency(transaction.tax.taxAmount)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-b border-dashed border-gray-400 py-2 mb-4">
        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL</span>
          <span>{formatCurrency(transaction.totalAmount)}</span>
        </div>
      </div>

      {/* Payment */}
      {transaction.payments.length > 0 && transaction.payments.map((payment) => (
        <div key={payment.id} className="space-y-1 text-xs mb-4">
          <div className="font-bold">Payment: {payment.paymentMethodName?.toUpperCase()}</div>
          <div className="flex justify-between">
            <span>Paid</span>
            <span>{formatCurrency(payment.amount)}</span>
          </div>
          {payment.changeAmount > 0 && (
            <div className="flex justify-between">
              <span>Change</span>
              <span>{formatCurrency(payment.changeAmount)}</span>
            </div>
          )}
          {payment.referenceNumber && (
            <div className="text-gray-600">
              Ref: {payment.referenceNumber}
            </div>
          )}
        </div>
      ))}

      {/* Divider */}
      <div className="border-t border-dashed border-gray-400 mb-4" />

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 space-y-1">
        <p>Thank you for your visit!</p>
        <p>Please come again</p>
      </div>

      {/* Print styling */}
      <style>{`
        @media print {
          .receipt-container {
            width: 80mm;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}
