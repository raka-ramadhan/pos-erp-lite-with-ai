import { X, Hash, Percent, Banknote, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { Discount, DiscountType } from '../../api/discount.api';
import { DISCOUNT_TYPE_OPTIONS } from '../../api/discount.api';

interface DiscountDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  discount: Discount | null;
  onEdit?: (discount: Discount) => void;
}

const DISCOUNT_TYPE_GRADIENTS: Record<DiscountType, string> = {
  percentage: 'from-blue-500 to-indigo-500',
  fixed_amount: 'from-green-500 to-emerald-500',
};

export function DiscountDetailDrawer({ isOpen, onClose, discount, onEdit }: DiscountDetailDrawerProps) {
  if (!isOpen || !discount) return null;

  const formatValue = () => {
    if (discount.discountType === 'percentage') {
      return `${discount.value}%`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(discount.value);
  };

  const formatAmount = (amount: number | null) => {
    if (amount === null) return 'No minimum';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'No end date';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDiscountTypeVariant = (type: DiscountType) => {
    const variants: Record<DiscountType, 'info' | 'success'> = {
      percentage: 'info',
      fixed_amount: 'success',
    };
    return variants[type];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Discount Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Discount Info */}
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${DISCOUNT_TYPE_GRADIENTS[discount.discountType]} flex items-center justify-center`}>
              {discount.discountType === 'percentage' ? (
                <Percent className="w-7 h-7 text-white" />
              ) : (
                <Banknote className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold text-slate-900">{discount.name}</h3>
                <Badge variant={discount.isActive ? 'success' : 'danger'} size="sm">
                  {discount.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-mono">{discount.code || 'No code'}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={getDiscountTypeVariant(discount.discountType)} size="md">
              {DISCOUNT_TYPE_OPTIONS[discount.discountType]?.label || discount.discountType}
            </Badge>
            <Badge variant="secondary" size="md">
              Value: {formatValue()}
            </Badge>
          </div>

          {/* Description */}
          {discount.description && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Description</h4>
              <p className="text-sm text-slate-700">{discount.description}</p>
            </div>
          )}

          {/* Discount Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
              Discount Configuration
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Value</p>
                <p className="text-lg font-semibold text-slate-900">{formatValue()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Min. Order</p>
                <p className="text-sm font-medium text-slate-900">{formatAmount(discount.minOrderAmount)}</p>
              </div>
            </div>

            {discount.discountType === 'percentage' && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Maximum Discount Cap</p>
                <p className="text-sm font-medium text-slate-900">
                  {discount.maxDiscountAmount ? formatAmount(discount.maxDiscountAmount) : 'No cap'}
                </p>
              </div>
            )}
          </div>

          {/* Validity Period */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
              Validity Period
            </h4>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Start Date</p>
                <p className="text-sm font-medium text-slate-900">
                  {discount.startDate
                    ? new Date(discount.startDate).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Always valid'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">End Date</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(discount.endDate)}</p>
              </div>
            </div>

            {/* Period Status */}
            {discount.startDate && discount.endDate && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600">
                  {new Date() >= new Date(discount.startDate) && new Date() <= new Date(discount.endDate)
                    ? '📅 This discount is currently active'
                    : new Date() < new Date(discount.startDate)
                    ? '⏰ This discount will start soon'
                    : '⏰ This discount has ended'}
                </p>
              </div>
            )}
          </div>

          {/* Sort Order */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
              Display
            </h4>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Hash className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Sort Order</p>
                <p className="text-sm font-medium text-slate-900">{discount.sortOrder}</p>
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
                  {discount.id}
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
                  {new Date(discount.createdAt).toLocaleString()}
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
                  {new Date(discount.updatedAt).toLocaleString()}
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
                onEdit(discount);
                onClose();
              }}
              leftIcon={<ChevronRight className="w-4 h-4" />}
            >
              Edit Discount
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
