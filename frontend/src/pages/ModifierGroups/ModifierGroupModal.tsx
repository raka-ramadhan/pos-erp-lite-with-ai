import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Select } from '../../components/ui/Select';
import { useCreateModifierGroup, useUpdateModifierGroup } from '../../hooks/useModifierGroups';
import type { ModifierGroup } from '../../api/modifier-group.api';

interface FormData {
  name: string;
  slug: string;
  description: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  minSelections?: string;
  maxSelections?: string;
}

interface ModifierGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  modifierGroup: ModifierGroup | null;
}

export function ModifierGroupModal({ isOpen, onClose, modifierGroup }: ModifierGroupModalProps) {
  const isEditing = !!modifierGroup;
  const createModifierGroup = useCreateModifierGroup();
  const updateModifierGroup = useUpdateModifierGroup();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    selectionType: 'single',
    isRequired: false,
    minSelections: 0,
    maxSelections: 1,
    sortOrder: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const isSubmitting = createModifierGroup.isPending || updateModifierGroup.isPending;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (modifierGroup) {
        setFormData({
          name: modifierGroup.name,
          slug: modifierGroup.slug || '',
          description: modifierGroup.description || '',
          selectionType: modifierGroup.selectionType as 'single' | 'multiple',
          isRequired: modifierGroup.isRequired,
          minSelections: modifierGroup.minSelections ?? 0,
          maxSelections: modifierGroup.maxSelections ?? 1,
          sortOrder: modifierGroup.sortOrder,
          isActive: modifierGroup.isActive,
        });
      } else {
        setFormData({
          name: '',
          slug: '',
          description: '',
          selectionType: 'single',
          isRequired: false,
          minSelections: 0,
          maxSelections: 1,
          sortOrder: 0,
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, modifierGroup]);

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when field changes
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectionTypeChange = (value: string) => {
    const selectionType = value as 'single' | 'multiple';
    setFormData((prev) => ({
      ...prev,
      selectionType,
      // Reset min/max when changing type
      ...(selectionType === 'single'
        ? { minSelections: 0, maxSelections: 1 }
        : { minSelections: prev.minSelections, maxSelections: prev.maxSelections }),
    }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.selectionType === 'multiple') {
      if (formData.minSelections < 0) {
        newErrors.minSelections = 'Minimum selections cannot be negative';
      }
      if (formData.maxSelections < 1) {
        newErrors.maxSelections = 'Maximum selections must be at least 1';
      }
      if (formData.minSelections > formData.maxSelections) {
        newErrors.minSelections = 'Minimum cannot be greater than maximum';
      }
    } else if (formData.selectionType === 'single') {
      if (formData.minSelections > 1) {
        newErrors.minSelections = 'Single choice cannot have minimum greater than 1';
      }
      if (formData.maxSelections > 1) {
        newErrors.maxSelections = 'Single choice cannot have maximum greater than 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      if (isEditing && modifierGroup) {
        await updateModifierGroup.mutateAsync({
          id: modifierGroup.id,
          data: {
            name: formData.name,
            slug: formData.slug || undefined,
            description: formData.description || undefined,
            selectionType: formData.selectionType,
            isRequired: formData.isRequired,
            minSelections: formData.selectionType === 'multiple' ? formData.minSelections : undefined,
            maxSelections: formData.selectionType === 'multiple' ? formData.maxSelections : undefined,
            sortOrder: formData.sortOrder,
            isActive: formData.isActive,
          },
        });
      } else {
        await createModifierGroup.mutateAsync({
          name: formData.name,
          slug: formData.slug || undefined,
          description: formData.description || undefined,
          selectionType: formData.selectionType,
          isRequired: formData.isRequired,
          minSelections: formData.selectionType === 'multiple' ? formData.minSelections : undefined,
          maxSelections: formData.selectionType === 'multiple' ? formData.maxSelections : undefined,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
        });
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
              {isEditing ? 'Edit Modifier Group' : 'Create New Modifier Group'}
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
                  label="Name *"
                  placeholder="e.g., Coffee Size, Sugar Level"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                />

                <Input
                  label="Slug"
                  placeholder="auto-generated-from-name"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
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

            {/* Selection Rule */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Selection Rule
              </h3>

              <div className="space-y-4">
                <Select
                  label="Selection Type"
                  options={[
                    { value: 'single', label: 'Single Choice - Customer picks exactly 1 option' },
                    { value: 'multiple', label: 'Multiple Choice - Customer can pick multiple options' },
                  ]}
                  value={formData.selectionType}
                  onChange={(e) => handleSelectionTypeChange(e.target.value)}
                />

                {formData.selectionType === 'multiple' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Minimum Selection"
                      type="number"
                      min={0}
                      value={formData.minSelections}
                      onChange={(e) => handleChange('minSelections', parseInt(e.target.value) || 0)}
                      error={errors.minSelections}
                    />
                    <Input
                      label="Maximum Selection"
                      type="number"
                      min={1}
                      value={formData.maxSelections}
                      onChange={(e) => handleChange('maxSelections', parseInt(e.target.value) || 1)}
                      error={errors.maxSelections}
                    />
                  </div>
                )}

                {formData.selectionType === 'multiple' && (
                  <div className="space-y-1">
                    <Checkbox
                      label="Required"
                      checked={formData.isRequired}
                      onChange={(e) => handleChange('isRequired', e.target.checked)}
                    />
                    <p className="text-xs text-slate-500">Customer must make at least the minimum selection</p>
                  </div>
                )}
              </div>
            </div>

            {/* Display Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Display Settings
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Sort Order"
                  type="number"
                  min={0}
                  value={formData.sortOrder}
                  onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
                />

                <div className="space-y-1">
                  <Checkbox
                    label="Active"
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                  />
                  <p className="text-xs text-slate-500">Show this modifier group in POS</p>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Single Choice:</strong> Customer selects exactly 1 option (e.g., Coffee Size: Small, Medium, Large)</li>
                <li><strong>Multiple Choice:</strong> Customer can select 0 to max options (e.g., Toppings: Whipped Cream, Caramel)</li>
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
