import { X, Folder, Image, Hash, Link, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { CategoryResponse } from '../../api/category.api';

interface CategoryDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryResponse | null;
  onEdit?: (category: CategoryResponse) => void;
}

export function CategoryDetailDrawer({ isOpen, onClose, category, onEdit }: CategoryDetailDrawerProps) {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Category Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Image */}
          {category.imageUrl && (
            <div className="mb-6">
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>
          )}

          {/* Category Info */}
          <div className="flex items-start gap-4 mb-6">
            {!category.imageUrl && (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Folder className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold text-slate-900">{category.name}</h3>
                <Badge variant={category.isActive ? 'success' : 'danger'} size="sm">
                  {category.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-mono">{category.slug}</p>
            </div>
          </div>

          {/* Description */}
          {category.description && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-500 mb-2">Description</h4>
              <p className="text-sm text-slate-700">{category.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4">
            {/* Parent Category */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Folder className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Parent Category</p>
                <p className="text-sm font-medium text-slate-900">
                  {category.parent?.name || 'Root Category'}
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
                <p className="text-sm font-medium text-slate-900">{category.sortOrder}</p>
              </div>
            </div>

            {/* Slug */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Link className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Slug</p>
                <p className="text-sm font-medium text-slate-900 font-mono">{category.slug}</p>
              </div>
            </div>

            {/* Image URL */}
            {category.imageUrl && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Image className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Image URL</p>
                  <p className="text-sm font-medium text-slate-900 truncate">{category.imageUrl}</p>
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
                <p className="text-sm font-medium text-slate-900 font-mono">{category.id}</p>
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
                  {category?.createdAt ? new Date(category.createdAt).toLocaleString() : '-'}
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
                  {category?.updatedAt ? new Date(category.updatedAt).toLocaleString() : '-'}
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
                onEdit(category);
                onClose();
              }}
              leftIcon={<ChevronRight className="w-4 h-4" />}
            >
              Edit Category
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
