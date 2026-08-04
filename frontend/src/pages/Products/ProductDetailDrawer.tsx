import { X, Image as ImageIcon, Package, Hash, DollarSign, Clock, ChevronRight, Tag, Layers } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { ProductResponse } from '../../api/product.api';

interface ProductDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductResponse | null;
  onEdit?: (product: ProductResponse) => void;
}

export function ProductDetailDrawer({ isOpen, onClose, product, onEdit }: ProductDetailDrawerProps) {
  if (!isOpen || !product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Product Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Image */}
          {product.imageUrl ? (
            <div className="rounded-xl overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-48 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-slate-400" />
            </div>
          )}

          {/* Product Info */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold text-slate-900">{product.name}</h3>
                <Badge variant={product.isActive ? 'success' : 'danger'} size="sm">
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-mono">{product.slug}</p>
              {product.sku && (
                <p className="text-xs text-slate-400 mt-1">SKU: {product.sku}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{formatPrice(product.price)}</p>
              <p className="text-xs text-slate-500">Selling Price</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={product.isAvailable ? 'info' : 'warning'}
              size="md"
            >
              {product.isAvailable ? 'In Stock' : 'Out of Stock'}
            </Badge>
            {product.isFeatured && (
              <Badge variant="warning" size="md">
                Featured
              </Badge>
            )}
            {product.hasVariants && (
              <Badge variant="secondary" size="md">
                Has Variants
              </Badge>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">Description</h4>
              <p className="text-sm text-slate-700">{product.description}</p>
            </div>
          )}

          {/* Category */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Category</p>
              <p className="text-sm font-medium text-slate-900">
                {product.category?.name || 'Uncategorized'}
              </p>
            </div>
          </div>

          {/* Tax */}
          {product.tax && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Applied Tax
              </h4>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <Tag className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">{product.tax.name}</span>
                <span className="text-xs text-slate-500">
                  {product.tax.taxType === 'percentage' ? `${product.tax.rate}%` : formatPrice(product.tax.rate)}
                </span>
              </div>
            </div>
          )}

          {/* Modifier Groups */}
          {product.modifierGroups && product.modifierGroups.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Modifier Groups ({product.modifierGroupCount})
              </h4>
              <div className="space-y-2">
                {product.modifierGroups.map((mg) => (
                  <div
                    key={mg.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">{mg.name}</p>
                      <p className="text-xs text-slate-500">
                        {mg.selectionType === 'single' ? 'Single choice' : 'Multiple choice'}
                        {mg.isRequired && ' • Required'}
                        {mg.modifierCount !== undefined && ` • ${mg.modifierCount} option${mg.modifierCount !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <Badge variant={mg.selectionType === 'single' ? 'info' : 'warning'} size="sm">
                      {mg.selectionType === 'single' ? 'Single' : 'Multiple'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Modifier Groups */}
          {(!product.modifierGroups || product.modifierGroups.length === 0) && (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <Layers className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Modifier Groups</p>
                <p className="text-sm font-medium text-slate-700">No modifiers assigned</p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
              Additional Information
            </h4>

            {/* Unit Type */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Unit Type</p>
                <p className="text-sm font-medium text-slate-900 capitalize">{product.unitType}</p>
              </div>
            </div>

            {/* Cost Price */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Cost Price</p>
                <p className="text-sm font-medium text-slate-900">
                  {product.costPrice ? formatPrice(product.costPrice) : '-'}
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
                <p className="text-sm font-medium text-slate-900">{product.sortOrder}</p>
              </div>
            </div>

            {/* Preparation Time */}
            {product.preparationTime && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Preparation Time</p>
                  <p className="text-sm font-medium text-slate-900">
                    {product.preparationTime} minutes
                  </p>
                </div>
              </div>
            )}

            {/* ID */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Hash className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">ID</p>
                <p className="text-sm font-medium text-slate-900 font-mono truncate">
                  {product.id}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Created</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(product.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Last Updated</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(product.updatedAt).toLocaleString()}
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
                onEdit(product);
                onClose();
              }}
              leftIcon={<ChevronRight className="w-4 h-4" />}
            >
              Edit Product
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
