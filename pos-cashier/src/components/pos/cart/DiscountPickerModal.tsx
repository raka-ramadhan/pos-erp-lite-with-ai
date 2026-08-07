import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Percent, Tag, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../ui';
import { useDiscounts, useApplyDiscount } from '../../../hooks';
import { cn } from '../../../utils';
import type { Discount } from '../../../api/discounts';

interface DiscountPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  currentSubtotal: number;
}

export function DiscountPickerModal({
  isOpen,
  onClose,
  orderId,
  currentSubtotal,
}: DiscountPickerModalProps) {
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch available discounts
  const { data: discounts = [], isLoading } = useDiscounts();

  // Apply discount mutation
  const applyDiscountMutation = useApplyDiscount(orderId);

  // Filter valid discounts for current subtotal
  const validDiscounts = useMemo(() => {
    return discounts.filter((discount) => {
      // Check minimum order amount
      if (discount.minOrderAmount && currentSubtotal < discount.minOrderAmount) {
        return false;
      }
      // Check date validity
      const now = new Date();
      if (discount.startDate && new Date(discount.startDate) > now) {
        return false;
      }
      if (discount.endDate && new Date(discount.endDate) < now) {
        return false;
      }
      return true;
    });
  }, [discounts, currentSubtotal]);

  // Calculate discount preview
  const discountPreview = useMemo(() => {
    if (!selectedDiscountId) return null;
    const discount = discounts.find((d) => d.id === selectedDiscountId);
    if (!discount) return null;

    let amount: number;
    if (discount.discountType === 'percentage') {
      amount = currentSubtotal * (Number(discount.value) / 100);
      if (discount.maxDiscountAmount && amount > discount.maxDiscountAmount) {
        amount = Number(discount.maxDiscountAmount);
      }
    } else {
      amount = Number(discount.value);
    }

    return {
      name: discount.name,
      type: discount.discountType,
      value: discount.value,
      amount: Math.round(amount),
    };
  }, [selectedDiscountId, discounts, currentSubtotal]);

  // Handle apply
  const handleApply = async () => {
    if (!selectedDiscountId) {
      setError('Pilih diskon terlebih dahulu');
      return;
    }

    setError(null);
    try {
      await applyDiscountMutation.mutateAsync(selectedDiscountId);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menerapkan diskon');
    }
  };

  // Handle close
  const handleClose = () => {
    setSelectedDiscountId(null);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                Pilih Diskon
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                </div>
              ) : validDiscounts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Tag className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500">Tidak ada diskon tersedia</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Minimum order Rp {currentSubtotal.toLocaleString('id-ID')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {validDiscounts.map((discount) => (
                    <DiscountCard
                      key={discount.id}
                      discount={discount}
                      subtotal={currentSubtotal}
                      isSelected={selectedDiscountId === discount.id}
                      onSelect={() => setSelectedDiscountId(discount.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-slate-100 bg-slate-50">
              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Preview */}
              {discountPreview && (
                <div className="mb-3 p-3 bg-amber-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-800">
                      Potongan: {discountPreview.name}
                    </span>
                    <span className="font-bold text-amber-600">
                      -Rp {discountPreview.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={!selectedDiscountId}
                  isLoading={applyDiscountMutation.isPending}
                  className="flex-1"
                >
                  {selectedDiscountId ? 'Terapkan' : 'Pilih Diskon'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Discount Card Component
interface DiscountCardProps {
  discount: Discount;
  subtotal: number;
  isSelected: boolean;
  onSelect: () => void;
}

function DiscountCard({ discount, subtotal, isSelected, onSelect }: DiscountCardProps) {
  // Calculate discount amount
  let discountAmount: number;
  if (discount.discountType === 'percentage') {
    discountAmount = subtotal * (Number(discount.value) / 100);
    if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
      discountAmount = Number(discount.maxDiscountAmount);
    }
  } else {
    discountAmount = Number(discount.value);
  }

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full p-4 rounded-xl border-2 text-left transition-all',
        isSelected
          ? 'border-amber-500 bg-amber-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{discount.name}</h3>
            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          {discount.description && (
            <p className="text-sm text-slate-500 mt-1">{discount.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant={discount.discountType === 'percentage' ? 'info' : 'default'}
              className="flex items-center gap-1"
            >
              <Percent className="w-3 h-3" />
              {discount.discountType === 'percentage'
                ? `${discount.value}%`
                : `Rp ${Number(discount.value).toLocaleString('id-ID')}`}
            </Badge>
            {discount.code && (
              <span className="text-xs text-slate-400">Code: {discount.code}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className={cn(
            'font-bold',
            isSelected ? 'text-amber-600' : 'text-green-600'
          )}>
            -Rp {Math.round(discountAmount).toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </button>
  );
}
