import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Select } from '../../components/ui/Select';
import { useCreateTax, useUpdateTax } from '../../hooks/useTaxes';
import type { Tax, CreateTaxDto, UpdateTaxDto } from '../../api/tax.api';

interface FormData {
  code: string;
  name: string;
  description: string;
  taxType: 'percentage' | 'fixed_amount';
  rate: number;
  isDefault: boolean;
  calculationBase: 'subtotal' | 'after_discount';
  calculationOrder: number;
  isInclusive: boolean;
  sortOrder: number;
  isActive: boolean;
}

interface FormErrors {
  code?: string;
  name?: string;
  rate?: string;
}

interface TaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  tax: Tax | null;
}

export function TaxModal({ isOpen, onClose, tax }: TaxModalProps) {
  const isEditing = !!tax;
  const createTax = useCreateTax();
  const updateTax = useUpdateTax();

  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    description: '',
    taxType: 'percentage',
    rate: 0,
    isDefault: false,
    calculationBase: 'subtotal',
    calculationOrder: 1,
    isInclusive: false,
    sortOrder: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const isSubmitting = createTax.isPending || updateTax.isPending;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (tax) {
        setFormData({
          code: tax.code,
          name: tax.name,
          description: tax.description || '',
          taxType: tax.taxType,
          rate: tax.rate,
          isDefault: tax.isDefault,
          calculationBase: tax.calculationBase as 'subtotal' | 'after_discount',
          calculationOrder: tax.calculationOrder,
          isInclusive: tax.isInclusive,
          sortOrder: (tax as any).sortOrder || 0,
          isActive: tax.isActive,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          description: '',
          taxType: 'percentage',
          rate: 0,
          isDefault: false,
          calculationBase: 'subtotal',
          calculationOrder: 1,
          isInclusive: false,
          sortOrder: 0,
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, tax]);

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when field changes
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.rate < 0) {
      newErrors.rate = 'Rate cannot be negative';
    }

    if (formData.taxType === 'percentage' && formData.rate > 100) {
      newErrors.rate = 'Percentage cannot exceed 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      if (isEditing && tax) {
        const payload: UpdateTaxDto = {
          code: formData.code,
          name: formData.name,
          description: formData.description || undefined,
          taxType: formData.taxType,
          rate: formData.rate,
          isDefault: formData.isDefault,
          calculationBase: formData.calculationBase,
          calculationOrder: formData.calculationOrder,
          isInclusive: formData.isInclusive,
          isActive: formData.isActive,
        };
        await updateTax.mutateAsync({ id: tax.id, data: payload });
      } else {
        const payload: CreateTaxDto = {
          code: formData.code,
          name: formData.name,
          description: formData.description || undefined,
          taxType: formData.taxType,
          rate: formData.rate,
          isDefault: formData.isDefault,
          calculationBase: formData.calculationBase,
          calculationOrder: formData.calculationOrder,
          isInclusive: formData.isInclusive,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
        };
        await createTax.mutateAsync(payload);
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
              {isEditing ? 'Edit Tax' : 'Create New Tax'}
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
                  label="Code *"
                  placeholder="e.g., PPN, SVC"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  error={errors.code}
                  disabled={isEditing}
                />

                <Input
                  label="Name *"
                  placeholder="e.g., Pajak Pertambahan Nilai"
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

            {/* Tax Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Tax Configuration
              </h3>

              <Select
                label="Tax Type *"
                options={[
                  { value: 'percentage', label: 'Percentage (%)' },
                  { value: 'fixed_amount', label: 'Fixed Amount (Rp)' },
                ]}
                value={formData.taxType}
                onChange={(e) => handleChange('taxType', e.target.value as 'percentage' | 'fixed_amount')}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rate {formData.taxType === 'percentage' ? '(%)' : '(Rp)'}
                </label>
                <div className="relative">
                  {formData.taxType === 'percentage' && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                  )}
                  <input
                    type="number"
                    min={0}
                    max={formData.taxType === 'percentage' ? 100 : undefined}
                    step={formData.taxType === 'percentage' ? 0.01 : 1}
                    value={formData.rate}
                    onChange={(e) => handleChange('rate', parseFloat(e.target.value) || 0)}
                    className={`w-full ${formData.taxType === 'percentage' ? 'pl-8' : 'pl-3'} pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder={formData.taxType === 'percentage' ? '0.00' : '0'}
                  />
                </div>
                {errors.rate && (
                  <p className="mt-1 text-xs text-red-600">{errors.rate}</p>
                )}
              </div>

              <Select
                label="Calculation Base"
                options={[
                  { value: 'subtotal', label: 'Subtotal (Before Discount)' },
                  { value: 'after_discount', label: 'After Discount' },
                ]}
                value={formData.calculationBase}
                onChange={(e) => handleChange('calculationBase', e.target.value as 'subtotal' | 'after_discount')}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Calculation Order"
                  type="number"
                  min={1}
                  value={formData.calculationOrder}
                  onChange={(e) => handleChange('calculationOrder', parseInt(e.target.value) || 1)}
                />

                <Input
                  label="Sort Order"
                  type="number"
                  min={0}
                  value={formData.sortOrder}
                  onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Flags */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Settings
              </h3>

              <div className="space-y-3">
                <Checkbox
                  label="Default Tax (auto applied to new products)"
                  checked={formData.isDefault}
                  onChange={(e) => handleChange('isDefault', e.target.checked)}
                />

                <Checkbox
                  label="Inclusive Tax (included in price)"
                  checked={formData.isInclusive}
                  onChange={(e) => handleChange('isInclusive', e.target.checked)}
                />

                <Checkbox
                  label="Active (can be used in orders)"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Percentage:</strong> e.g., 11% PPN</li>
                <li><strong>Fixed Amount:</strong> e.g., Rp 2.000 service charge</li>
                <li><strong>Default Tax:</strong> Applied automatically to new products</li>
                <li><strong>Calculation Order:</strong> Determines when tax is calculated (1 = first)</li>
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
