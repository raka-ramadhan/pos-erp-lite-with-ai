import { X, Pencil, Check, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { Modifier } from '../../api/modifier.api';

interface ModifierDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  modifier: Modifier | null;
  onEdit?: (modifier: Modifier) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function ModifierDetailDrawer({
  isOpen,
  onClose,
  modifier,
  onEdit,
}: ModifierDetailDrawerProps) {
  if (!isOpen || !modifier) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Modifier Details</h2>
            <p className="text-sm text-slate-500">{modifier.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={modifier.isActive ? 'success' : 'danger'}
              size="md"
            >
              {modifier.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge
              variant={modifier.isAvailable ? 'success' : 'warning'}
              size="md"
            >
              {modifier.isAvailable ? 'Available' : 'Unavailable'}
            </Badge>
            {modifier.isDefault && (
              <Badge variant="info" size="md">
                Default
              </Badge>
            )}
          </div>

          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
              General Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Modifier Group</p>
                <p className="text-sm font-medium text-slate-900">
                  {modifier.modifierGroup?.name || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">SKU</p>
                <p className="text-sm font-mono text-slate-600">
                  {modifier.sku || '-'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-1">Name</p>
                <p className="text-sm font-medium text-slate-900">{modifier.name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-600">
                  {modifier.description || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
              Pricing
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Additional Price</p>
                <p className={`text-lg font-semibold ${modifier.additionalPrice > 0 ? 'text-indigo-600' : 'text-slate-600'}`}>
                  {modifier.additionalPrice > 0 ? `+${formatCurrency(modifier.additionalPrice)}` : 'Free'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Cost Price</p>
                <p className="text-sm font-medium text-slate-900">
                  {modifier.costPrice ? formatCurrency(modifier.costPrice) : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Selection Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
              Selection Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Default Selection</p>
                <p className="text-sm font-medium">
                  {modifier.isDefault ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="w-4 h-4" /> Yes
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <AlertCircle className="w-4 h-4" /> No
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Availability</p>
                <p className="text-sm font-medium">
                  {modifier.isAvailable ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="w-4 h-4" /> Available
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600">
                      <AlertCircle className="w-4 h-4" /> Unavailable
                    </span>
                  )}
                </p>
              </div>
              {modifier.modifierGroup && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Selection Type</p>
                  <p className="text-sm font-medium text-slate-900">
                    {modifier.modifierGroup.selectionType === 'single' ? 'Single Choice' : 'Multiple Choice'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
              Audit Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Sort Order</p>
                <p className="text-sm text-slate-900">{modifier.sortOrder}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Created</p>
                <p className="text-sm text-slate-900">
                  {new Date(modifier.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-1">Last Updated</p>
                <p className="text-sm text-slate-900">
                  {new Date(modifier.updatedAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {onEdit && (
          <div className="px-6 py-4 border-t border-slate-200">
            <Button
              variant="primary"
              className="w-full"
              leftIcon={<Pencil className="w-4 h-4" />}
              onClick={() => onEdit(modifier)}
            >
              Edit Modifier
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
