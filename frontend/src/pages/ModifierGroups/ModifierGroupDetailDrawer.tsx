import { X, Pencil, Check, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { ModifierGroup } from '../../api/modifier-group.api';

interface ModifierGroupDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  modifierGroup: ModifierGroup | null;
  onEdit?: (modifierGroup: ModifierGroup) => void;
}

export function ModifierGroupDetailDrawer({
  isOpen,
  onClose,
  modifierGroup,
  onEdit,
}: ModifierGroupDetailDrawerProps) {
  if (!isOpen || !modifierGroup) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Modifier Group Details</h2>
            <p className="text-sm text-slate-500">{modifierGroup.name}</p>
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
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={modifierGroup.isActive ? 'success' : 'danger'}
              size="md"
            >
              {modifierGroup.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge
              variant={modifierGroup.selectionType === 'single' ? 'info' : 'warning'}
              size="md"
            >
              {modifierGroup.selectionType === 'single' ? 'Single Choice' : 'Multiple Choice'}
            </Badge>
            {modifierGroup.isRequired && (
              <Badge variant="danger" size="md">
                Required
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
                <p className="text-xs text-slate-500 mb-1">Name</p>
                <p className="text-sm font-medium text-slate-900">{modifierGroup.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Slug</p>
                <p className="text-sm font-mono text-slate-600">{modifierGroup.slug}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-600">
                  {modifierGroup.description || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Selection Rule */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
              Selection Rule
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Selection Type</p>
                <p className="text-sm font-medium text-slate-900">
                  {modifierGroup.selectionType === 'single' ? 'Single Choice' : 'Multiple Choice'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Required</p>
                <p className="text-sm font-medium text-slate-900">
                  {modifierGroup.isRequired ? (
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

              {modifierGroup.selectionType === 'multiple' && (
                <>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Minimum Selection</p>
                    <p className="text-sm font-medium text-slate-900">
                      {modifierGroup.minSelections ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Maximum Selection</p>
                    <p className="text-sm font-medium text-slate-900">
                      {modifierGroup.maxSelections ?? 1}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Modifiers List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-semibold text-slate-700">
                Modifiers
              </h3>
              <span className="text-xs text-slate-500">
                {modifierGroup.modifierCount ?? modifierGroup.modifiers?.length ?? 0} items
              </span>
            </div>

            {modifierGroup.modifiers && modifierGroup.modifiers.length > 0 ? (
              <div className="space-y-2">
                {modifierGroup.modifiers
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((modifier) => (
                    <div
                      key={modifier.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {modifier.isDefault && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500" title="Default" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900">{modifier.name}</p>
                          {modifier.sku && (
                            <p className="text-xs text-slate-500 font-mono">{modifier.sku}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {modifier.additionalPrice > 0 && (
                          <p className="text-sm font-medium text-indigo-600">
                            +{formatPrice(modifier.additionalPrice)}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {modifier.isDefault && (
                            <Badge variant="info" size="sm">Default</Badge>
                          )}
                          {!modifier.isAvailable && (
                            <Badge variant="danger" size="sm">Unavailable</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-sm">
                No modifiers yet
              </div>
            )}
          </div>

          {/* Audit Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
              Audit Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Sort Order</p>
                <p className="text-sm text-slate-900">{modifierGroup.sortOrder}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Created</p>
                <p className="text-sm text-slate-900">
                  {new Date(modifierGroup.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-1">Last Updated</p>
                <p className="text-sm text-slate-900">
                  {new Date(modifierGroup.updatedAt).toLocaleDateString('id-ID', {
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
              onClick={() => onEdit(modifierGroup)}
            >
              Edit Modifier Group
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
