import { X, Hash, DollarSign, Percent, ChevronRight, Clock, Tag } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { Tax } from '../../api/tax.api';

interface TaxDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tax: Tax | null;
  onEdit?: (tax: Tax) => void;
}

export function TaxDetailDrawer({ isOpen, onClose, tax, onEdit }: TaxDetailDrawerProps) {
  if (!isOpen || !tax) return null;

  const formatRate = () => {
    if (tax.taxType === 'percentage') {
      return `${tax.rate}%`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(tax.rate);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Tax Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tax Info */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              {tax.taxType === 'percentage' ? (
                <Percent className="w-7 h-7 text-white" />
              ) : (
                <DollarSign className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold text-slate-900">{tax.name}</h3>
                <Badge variant={tax.isActive ? 'success' : 'danger'} size="sm">
                  {tax.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-mono">{tax.code}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{formatRate()}</p>
              <p className="text-xs text-slate-500">
                {tax.taxType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
              </p>
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-2">
            {tax.isDefault && (
              <Badge variant="warning" size="md">
                Default Tax
              </Badge>
            )}
            {tax.isInclusive && (
              <Badge variant="secondary" size="md">
                Inclusive
              </Badge>
            )}
            <Badge
              variant={tax.taxType === 'percentage' ? 'info' : 'secondary'}
              size="md"
            >
              {tax.taxType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
            </Badge>
          </div>

          {/* Description */}
          {tax.description && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Description</h4>
              <p className="text-sm text-slate-700">{tax.description}</p>
            </div>
          )}

          {/* Tax Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
              Tax Configuration
            </h4>

            {/* Calculation Base */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Tag className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Calculation Base</p>
                <p className="text-sm font-medium text-slate-900 capitalize">
                  {tax.calculationBase === 'subtotal' ? 'Subtotal (Before Discount)' : 'After Discount'}
                </p>
              </div>
            </div>

            {/* Calculation Order */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Hash className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Calculation Order</p>
                <p className="text-sm font-medium text-slate-900">{tax.calculationOrder}</p>
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
                  {tax.id}
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
                  {new Date(tax.createdAt).toLocaleString()}
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
                  {new Date(tax.updatedAt).toLocaleString()}
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
                onEdit(tax);
                onClose();
              }}
              leftIcon={<ChevronRight className="w-4 h-4" />}
            >
              Edit Tax
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
