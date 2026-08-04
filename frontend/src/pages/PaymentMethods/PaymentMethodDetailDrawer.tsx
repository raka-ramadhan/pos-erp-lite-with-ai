import { X, Hash, CreditCard, Smartphone, Building2, Wallet, QrCode, List, Link, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { PaymentMethod, PaymentType } from '../../api/payment-method.api';
import { PAYMENT_TYPE_OPTIONS } from '../../api/payment-method.api';

interface PaymentMethodDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethod | null;
  onEdit?: (pm: PaymentMethod) => void;
}

const PAYMENT_TYPE_ICONS: Record<PaymentType, React.ReactNode> = {
  cash: <Wallet className="w-7 h-7 text-white" />,
  e_wallet: <Smartphone className="w-7 h-7 text-white" />,
  bank_transfer: <Building2 className="w-7 h-7 text-white" />,
  card: <CreditCard className="w-7 h-7 text-white" />,
  qris: <QrCode className="w-7 h-7 text-white" />,
  other: <List className="w-7 h-7 text-white" />,
};

const PAYMENT_TYPE_GRADIENTS: Record<PaymentType, string> = {
  cash: 'from-green-500 to-emerald-500',
  e_wallet: 'from-blue-500 to-indigo-500',
  bank_transfer: 'from-purple-500 to-violet-500',
  card: 'from-orange-500 to-amber-500',
  qris: 'from-pink-500 to-rose-500',
  other: 'from-slate-500 to-gray-500',
};

export function PaymentMethodDetailDrawer({ isOpen, onClose, paymentMethod, onEdit }: PaymentMethodDetailDrawerProps) {
  if (!isOpen || !paymentMethod) return null;

  const formatAmount = (amount: number | null) => {
    if (amount === null) return 'No limit';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentTypeVariant = (type: PaymentType) => {
    const variants: Record<PaymentType, 'info' | 'secondary' | 'warning' | 'success' | 'danger'> = {
      cash: 'success',
      e_wallet: 'info',
      bank_transfer: 'secondary',
      card: 'warning',
      qris: 'info',
      other: 'secondary',
    };
    return variants[type];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Payment Method Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Payment Method Info */}
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${PAYMENT_TYPE_GRADIENTS[paymentMethod.paymentType]} flex items-center justify-center`}>
              {PAYMENT_TYPE_ICONS[paymentMethod.paymentType]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold text-slate-900">{paymentMethod.name}</h3>
                <Badge variant={paymentMethod.isActive ? 'success' : 'danger'} size="sm">
                  {paymentMethod.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-mono">{paymentMethod.code}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={getPaymentTypeVariant(paymentMethod.paymentType)} size="md">
              {PAYMENT_TYPE_OPTIONS[paymentMethod.paymentType]?.label || paymentMethod.paymentType}
            </Badge>
            {paymentMethod.isIntegration && (
              <Badge variant="info" size="md">
                External Integration
              </Badge>
            )}
          </div>

          {/* Description */}
          {paymentMethod.description && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Description</h4>
              <p className="text-sm text-slate-700">{paymentMethod.description}</p>
            </div>
          )}

          {/* Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
              Configuration
            </h4>

            {/* Provider */}
            {paymentMethod.provider && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Provider</p>
                  <p className="text-sm font-medium text-slate-900">{paymentMethod.provider}</p>
                </div>
              </div>
            )}

            {/* Icon */}
            {paymentMethod.iconUrl && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img src={paymentMethod.iconUrl} alt="" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Icon URL</p>
                  <p className="text-sm font-medium text-slate-900 truncate">{paymentMethod.iconUrl}</p>
                </div>
              </div>
            )}

            {/* Integration */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Link className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Integration</p>
                <p className="text-sm font-medium text-slate-900">
                  {paymentMethod.isIntegration ? 'External (EDC, Gateway)' : 'Built-in'}
                </p>
              </div>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Hash className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Sort Order</p>
                <p className="text-sm font-medium text-slate-900">{paymentMethod.sortOrder}</p>
              </div>
            </div>
          </div>

          {/* Transaction Limits */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
              Transaction Limits
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Minimum Amount</p>
                <p className="text-sm font-medium text-slate-900">{formatAmount(paymentMethod.minAmount)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Maximum Amount</p>
                <p className="text-sm font-medium text-slate-900">{formatAmount(paymentMethod.maxAmount)}</p>
              </div>
            </div>
          </div>

          {/* Audit Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
              Audit Information
            </h4>

            {/* ID */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Hash className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">ID</p>
                <p className="text-sm font-medium text-slate-900 font-mono truncate">
                  {paymentMethod.id}
                </p>
              </div>
            </div>

            {/* Created */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Created</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(paymentMethod.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Updated */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Last Updated</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(paymentMethod.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200">
          {onEdit && (
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                onEdit(paymentMethod);
                onClose();
              }}
              leftIcon={<ChevronRight className="w-4 h-4" />}
            >
              Edit Payment Method
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
