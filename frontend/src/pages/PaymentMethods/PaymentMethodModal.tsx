import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Select } from '../../components/ui/Select';
import { useCreatePaymentMethod, useUpdatePaymentMethod } from '../../hooks/usePaymentMethods';
import type { PaymentMethod, CreatePaymentMethodDto, UpdatePaymentMethodDto, PaymentType } from '../../api/payment-method.api';
import { PAYMENT_TYPE_OPTIONS } from '../../api/payment-method.api';

interface FormData {
  code: string;
  name: string;
  description: string;
  paymentType: PaymentType;
  provider: string;
  iconUrl: string;
  isIntegration: boolean;
  minAmount: string;
  maxAmount: string;
  sortOrder: number;
  isActive: boolean;
}

interface FormErrors {
  code?: string;
  name?: string;
  paymentType?: string;
}

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethod | null;
}

export function PaymentMethodModal({ isOpen, onClose, paymentMethod }: PaymentMethodModalProps) {
  const isEditing = !!paymentMethod;
  const createPaymentMethod = useCreatePaymentMethod();
  const updatePaymentMethod = useUpdatePaymentMethod();

  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    description: '',
    paymentType: 'cash',
    provider: '',
    iconUrl: '',
    isIntegration: false,
    minAmount: '',
    maxAmount: '',
    sortOrder: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const isSubmitting = createPaymentMethod.isPending || updatePaymentMethod.isPending;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (paymentMethod) {
        setFormData({
          code: paymentMethod.code,
          name: paymentMethod.name,
          description: paymentMethod.description || '',
          paymentType: paymentMethod.paymentType,
          provider: paymentMethod.provider || '',
          iconUrl: paymentMethod.iconUrl || '',
          isIntegration: paymentMethod.isIntegration,
          minAmount: paymentMethod.minAmount?.toString() || '',
          maxAmount: paymentMethod.maxAmount?.toString() || '',
          sortOrder: paymentMethod.sortOrder,
          isActive: paymentMethod.isActive,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          description: '',
          paymentType: 'cash',
          provider: '',
          iconUrl: '',
          isIntegration: false,
          minAmount: '',
          maxAmount: '',
          sortOrder: 0,
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, paymentMethod]);

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
    } else if (formData.code.length > 30) {
      newErrors.code = 'Code must be 30 characters or less';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.paymentType) {
      newErrors.paymentType = 'Payment type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      const basePayload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        paymentType: formData.paymentType,
        provider: formData.provider.trim() || undefined,
        iconUrl: formData.iconUrl.trim() || undefined,
        isIntegration: formData.isIntegration,
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : undefined,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      };

      if (isEditing && paymentMethod) {
        const payload: UpdatePaymentMethodDto = basePayload;
        await updatePaymentMethod.mutateAsync({ id: paymentMethod.id, data: payload });
      } else {
        const payload: CreatePaymentMethodDto = basePayload;
        await createPaymentMethod.mutateAsync(payload);
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
              {isEditing ? 'Edit Payment Method' : 'Create New Payment Method'}
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
                  placeholder="e.g., CASH, QRIS"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  error={errors.code}
                  disabled={isEditing}
                />

                <Input
                  label="Name *"
                  placeholder="e.g., Cash, GoPay, BCA Transfer"
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

            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Configuration
              </h3>

              <Select
                label="Payment Type *"
                options={[
                  { value: 'cash', label: '💵 Cash' },
                  { value: 'e_wallet', label: '📱 E-Wallet' },
                  { value: 'bank_transfer', label: '🏦 Bank Transfer' },
                  { value: 'card', label: '💳 Card' },
                  { value: 'qris', label: '📲 QRIS' },
                  { value: 'other', label: '📋 Other' },
                ]}
                value={formData.paymentType}
                onChange={(e) => handleChange('paymentType', e.target.value as PaymentType)}
                error={errors.paymentType}
              />

              <Input
                label="Provider"
                placeholder="e.g., GoPay, OVO, DANA, Bank BCA"
                value={formData.provider}
                onChange={(e) => handleChange('provider', e.target.value)}
              />

              <Input
                label="Icon URL"
                placeholder="https://example.com/icon.png"
                value={formData.iconUrl}
                onChange={(e) => handleChange('iconUrl', e.target.value)}
              />
            </div>

            {/* Limits */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Transaction Limits
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Amount (Rp)"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.minAmount}
                  onChange={(e) => handleChange('minAmount', e.target.value)}
                />

                <Input
                  label="Max Amount (Rp)"
                  type="number"
                  min={0}
                  placeholder="No limit"
                  value={formData.maxAmount}
                  onChange={(e) => handleChange('maxAmount', e.target.value)}
                />
              </div>
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

              <div className="space-y-3">
                <Checkbox
                  label="Requires External Integration"
                  checked={formData.isIntegration}
                  onChange={(e) => handleChange('isIntegration', e.target.checked)}
                />

                <Checkbox
                  label="Active (available for transactions)"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Cash:</strong> Standard cash payments</li>
                <li><strong>E-Wallet:</strong> Digital wallets like GoPay, OVO, DANA</li>
                <li><strong>Bank Transfer:</strong> Manual bank transfers</li>
                <li><strong>Card:</strong> Credit/Debit cards via EDC</li>
                <li><strong>QRIS:</strong> Unified QR code payments</li>
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
