import { X, Square, Users, Hash, MapPin, Clock } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { DiningTableResponse, DiningTableStatus } from '../../api/dining-table.api';

const STATUS_CONFIG: Record<DiningTableStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'default' }> = {
  available: { label: 'Available', variant: 'success' },
  reserved: { label: 'Reserved', variant: 'warning' },
  cleaning: { label: 'Cleaning', variant: 'info' },
  inactive: { label: 'Inactive', variant: 'default' },
};

interface DiningTableDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  table: DiningTableResponse | null;
  onEdit?: (table: DiningTableResponse) => void;
}

export function DiningTableDetailDrawer({ isOpen, onClose, table, onEdit }: DiningTableDetailDrawerProps) {
  if (!isOpen || !table) return null;

  const statusConfig = STATUS_CONFIG[table.status] || STATUS_CONFIG.available;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Dining Table Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Table Info */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Square className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold text-slate-900">{table.tableName}</h3>
                <Badge variant={statusConfig.variant} size="sm">
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-mono">{table.tableCode}</p>
            </div>
          </div>

          {/* Description */}
          {table.description && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-500 mb-2">Description</h4>
              <p className="text-sm text-slate-700">{table.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4">
            {/* Area */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Area</p>
                <p className="text-sm font-medium text-slate-900">
                  {table.areaName || 'No area assigned'}
                </p>
              </div>
            </div>

            {/* Capacity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Capacity</p>
                <p className="text-sm font-medium text-slate-900">{table.capacity} seats</p>
              </div>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Hash className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Sort Order</p>
                <p className="text-sm font-medium text-slate-900">{table.sortOrder}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Square className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Status</p>
                <p className="text-sm font-medium text-slate-900">{statusConfig.label}</p>
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
                  {new Date(table.createdAt).toLocaleString()}
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
                  {new Date(table.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                onEdit(table);
                onClose();
              }}
              leftIcon={<X className="w-4 h-4" />}
            >
              Edit Table
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
