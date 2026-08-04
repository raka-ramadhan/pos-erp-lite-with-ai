import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Select } from '../../components/ui/Select';
import { useCreateDiscount, useUpdateDiscount } from '../../hooks/useDiscounts';
import type { Discount, CreateDiscountDto, UpdateDiscountDto, DiscountType } from '../../api/discount.api';

interface FormData {
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  value: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  startDate: string;
  endDate: string;
  sortOrder: number;
  isActive: boolean;
}

interface FormErrors {
  code?: string;
  name?: string;
  discountType?: string;
  value?: string;
  minOrderAmount?: string;
  maxDiscountAmount?: string;
  startDate?: string;
  endDate?: string;
}

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: Discount | null;
}

export function DiscountModal({ isOpen, onClose, discount }: DiscountModalProps) {
  const isEditing = !!discount;
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();

  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    sortOrder: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const isSubmitting = createDiscount.isPending || updateDiscount.isPending;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (discount) {
        setFormData({
          code: discount.code || '',
          name: discount.name,
          description: discount.description || '',
          discountType: discount.discountType,
          value: discount.value.toString(),
          minOrderAmount: discount.minOrderAmount?.toString() || '',
          maxDiscountAmount: discount.maxDiscountAmount?.toString() || '',
          startDate: discount.startDate || '',
          endDate: discount.endDate || '',
          sortOrder: discount.sortOrder,
          isActive: discount.isActive,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          description: '',
          discountType: 'percentage',
          value: '',
          minOrderAmount: '',
          maxDiscountAmount: '',
          startDate: '',
          endDate: '',
          sortOrder: 0,
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, discount]);

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when field changes
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.discountType) {
      newErrors.discountType = 'Discount type is required';
    }

    if (!formData.value.trim()) {
      newErrors.value = 'Value is required';
    } else {
      const numValue = parseFloat(formData.value);
      if (isNaN(numValue) || numValue <= 0) {
        newErrors.value = 'Value must be a positive number';
      } else if (formData.discountType === 'percentage' && numValue > 100) {
        newErrors.value = 'Percentage cannot exceed 100%';
      }
    }

    if (formData.minOrderAmount && parseFloat(formData.minOrderAmount) < 0) {
      newErrors.minOrderAmount = 'Minimum order amount cannot be negative';
    }

    if (formData.maxDiscountAmount && parseFloat(formData.maxDiscountAmount) < 0) {
      newErrors.maxDiscountAmount = 'Maximum discount cannot be negative';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date cannot be before start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      const basePayload = {
        code: formData.code.trim() || undefined,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        discountType: formData.discountType,
        value: parseFloat(formData.value),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      };

      if (isEditing && discount) {
        const payload: UpdateDiscountDto = basePayload;
        await updateDiscount.mutateAsync({ id: discount.id, data: payload });
      } else {
        const payload: CreateDiscountDto = basePayload;
        await createDiscount.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit Discount' : 'Create New Discount'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* General Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                General Information
              </h3>

              <div className="space-y-4">
                <Input
                  label="Code"
                  placeholder="e.g., PROMO10, DISCOUNT20"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  error={errors.code}
                  disabled={isEditing}
                />

                <Input
                  label="Name *"
                  placeholder="e.g., Employee Discount, Happy Hour"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Discount Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Discount Configuration
              </h3>

              <Select
                label="Discount Type *"
                options={[
                  { value: 'percentage', label: '📊 Percentage' },
                  { value: 'fixed_amount', label: '💰 Fixed Amount' },
                ]}
                value={formData.discountType}
                onChange={(e) => handleChange('discountType', e.target.value as DiscountType)}
                error={errors.discountType}
              />

              <Input
                label={formData.discountType === 'percentage' ? 'Value (%) *' : 'Value (Rp) *'}
                type="number"
                min={0}
                max={formData.discountType === 'percentage' ? 100 : undefined}
                step={formData.discountType === 'percentage' ? '0.01' : '1'}
                placeholder={formData.discountType === 'percentage' ? 'e.g., 10' : 'e.g., 10000'}
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                error={errors.value}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min. Order (Rp)"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.minOrderAmount}
                  onChange={(e) => handleChange('minOrderAmount', e.target.value)}
                  error={errors.minOrderAmount}
                />

                {formData.discountType === 'percentage' && (
                  <Input
                    label="Max. Discount (Rp)"
                    type="number"
                    min={0}
                    placeholder="No cap"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => handleChange('maxDiscountAmount', e.target.value)}
                    error={errors.maxDiscountAmount}
                  />
                )}
              </div>
            </div>

            {/* Validity Period */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Validity Period
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  error={errors.startDate}
                />

                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  error={errors.endDate}
                />
              </div>

              <p className="text-xs text-slate-500">
                Leave empty if the discount is always valid
              </p>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Settings
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Sort Order"
                  type="number"
                  min={0}
                  value={formData.sortOrder}
                  onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
                />
              </div>

              <Checkbox
                label="Active (available for transactions)"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
              />
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Percentage:</strong> e.g., 10% off, capped at Rp50.000</li>
                <li><strong>Fixed Amount:</strong> e.g., Rp25.000 off per transaction</li>
                <li>Set minimum order to require a purchase threshold</li>
                <li>Use validity period for limited-time promotions</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 sticky bottom-0 bg-white">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onSubmit} isLoading={isSubmitting}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
