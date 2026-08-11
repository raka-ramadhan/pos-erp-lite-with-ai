import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, Input } from '../../ui';
import { cn } from '../../../utils';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderNumber: string;
  isLoading?: boolean;
}

export function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isLoading,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  const canSubmit = reason.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-900">Batalkan Order?</h2>
              <p className="text-sm text-red-700">#{orderNumber}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Order akan dibatalkan dan tidak dapat dikembalikan. Semua item pesanan akan dihapus.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Alasan Pembatalan <span className="text-red-500">*</span>
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Customer berubah pikiran"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Kembali
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            isLoading={isLoading}
          >
            Batalkan Order
          </Button>
        </div>
      </div>
    </div>
  );
}
