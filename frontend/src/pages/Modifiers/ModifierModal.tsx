import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { useCreateModifier, useUpdateModifier } from '../../hooks/useModifiers';
import { useActiveModifierGroups } from '../../hooks/useModifierGroups';
import type { Modifier } from '../../api/modifier.api';
import type { ModifierGroup } from '../../api/modifier-group.api';

interface FormData {
  modifierGroupId: string;
  name: string;
  sku: string;
  description: string;
  additionalPrice: number;
  costPrice: string;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
  isActive: boolean;
}

interface FormErrors {
  modifierGroupId?: string;
  name?: string;
  additionalPrice?: string;
}

interface ModifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  modifier: Modifier | null;
}

export function ModifierModal({ isOpen, onClose, modifier }: ModifierModalProps) {
  const isEditing = !!modifier;
  const createModifier = useCreateModifier();
  const updateModifier = useUpdateModifier();

  const { data: modifierGroupsData } = useActiveModifierGroups();
  const modifierGroups = modifierGroupsData || [];

  const [formData, setFormData] = useState<FormData>({
    modifierGroupId: '',
    name: '',
    sku: '',
    description: '',
    additionalPrice: 0,
    costPrice: '',
    isDefault: false,
    isAvailable: true,
    sortOrder: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [searchGroup, setSearchGroup] = useState('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const isSubmitting = createModifier.isPending || updateModifier.isPending;

  // Filter modifier groups based on search
  const filteredGroups = modifierGroups.filter((g: ModifierGroup) =>
    g.name.toLowerCase().includes(searchGroup.toLowerCase())
  );

  // Get selected group name
  const selectedGroup = modifierGroups.find((g: ModifierGroup) => g.id === formData.modifierGroupId);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (modifier) {
        setFormData({
          modifierGroupId: modifier.modifierGroupId,
          name: modifier.name,
          sku: modifier.sku || '',
          description: modifier.description || '',
          additionalPrice: modifier.additionalPrice,
          costPrice: modifier.costPrice?.toString() || '',
          isDefault: modifier.isDefault,
          isAvailable: modifier.isAvailable,
          sortOrder: modifier.sortOrder,
          isActive: modifier.isActive,
        });
      } else {
        setFormData({
          modifierGroupId: '',
          name: '',
          sku: '',
          description: '',
          additionalPrice: 0,
          costPrice: '',
          isDefault: false,
          isAvailable: true,
          sortOrder: 0,
          isActive: true,
        });
      }
      setSearchGroup('');
      setShowGroupDropdown(false);
      setErrors({});
    }
  }, [isOpen, modifier]);

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when field changes
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const selectModifierGroup = (group: ModifierGroup) => {
    setFormData((prev) => ({ ...prev, modifierGroupId: group.id }));
    setSearchGroup('');
    setShowGroupDropdown(false);
    if (errors.modifierGroupId) {
      setErrors((prev) => ({ ...prev, modifierGroupId: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.modifierGroupId) {
      newErrors.modifierGroupId = 'Modifier group is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.additionalPrice < 0) {
      newErrors.additionalPrice = 'Additional price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        modifierGroupId: formData.modifierGroupId,
        name: formData.name,
        sku: formData.sku || undefined,
        description: formData.description || undefined,
        additionalPrice: formData.additionalPrice,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        isDefault: formData.isDefault,
        isAvailable: formData.isAvailable,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      };

      if (isEditing && modifier) {
        await updateModifier.mutateAsync({
          id: modifier.id,
          data: payload,
        });
      } else {
        await createModifier.mutateAsync(payload);
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
              {isEditing ? 'Edit Modifier' : 'Create New Modifier'}
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
                {/* Modifier Group - Searchable Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Modifier Group *
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={selectedGroup?.name || modifierGroups.find((g: ModifierGroup) => g.id === modifier?.modifierGroupId)?.name || ''}
                      disabled
                    />
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-left bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <span className={selectedGroup ? 'text-slate-900' : 'text-slate-400'}>
                          {selectedGroup?.name || 'Select modifier group...'}
                        </span>
                        <Search className="w-4 h-4 text-slate-400" />
                      </button>

                      {showGroupDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                          <div className="p-2 border-b border-slate-200">
                            <input
                              type="text"
                              placeholder="Search modifier groups..."
                              value={searchGroup}
                              onChange={(e) => setSearchGroup(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredGroups.length > 0 ? (
                              filteredGroups.map((group: ModifierGroup) => (
                                <button
                                  key={group.id}
                                  type="button"
                                  onClick={() => selectModifierGroup(group)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
                                >
                                  <span className="text-slate-900">{group.name}</span>
                                  {group.id === formData.modifierGroupId && (
                                    <span className="text-indigo-600">✓</span>
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-center text-sm text-slate-500">
                                No modifier groups found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {errors.modifierGroupId && (
                    <p className="mt-1 text-xs text-red-600">{errors.modifierGroupId}</p>
                  )}
                </div>

                <Input
                  label="Name *"
                  placeholder="e.g., Small, Medium, Large"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                />

                <Input
                  label="SKU"
                  placeholder="Optional SKU code"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
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

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Pricing
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Additional Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rp</span>
                    <input
                      type="number"
                      min={0}
                      value={formData.additionalPrice}
                      onChange={(e) => handleChange('additionalPrice', parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0"
                    />
                  </div>
                  {errors.additionalPrice && (
                    <p className="mt-1 text-xs text-red-600">{errors.additionalPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cost Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rp</span>
                    <input
                      type="text"
                      value={formData.costPrice}
                      onChange={(e) => handleChange('costPrice', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Display Settings
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Sort Order"
                    type="number"
                    min={0}
                    value={formData.sortOrder}
                    onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
                  />

                  <div className="flex flex-col gap-3 pt-6">
                    <Checkbox
                      label="Default"
                      checked={formData.isDefault}
                      onChange={(e) => handleChange('isDefault', e.target.checked)}
                    />
                    <p className="text-xs text-slate-500">Pre-selected when group loads</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Checkbox
                    label="Available"
                    checked={formData.isAvailable}
                    onChange={(e) => handleChange('isAvailable', e.target.checked)}
                  />
                  <Checkbox
                    label="Active"
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                  />
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Modifier Group:</strong> Groups modifiers (e.g., Size, Toppings)</li>
                <li><strong>Additional Price:</strong> Extra charge for this option</li>
                <li><strong>Default:</strong> Pre-selected option in POS</li>
                <li><strong>Available:</strong> Can be selected by customers</li>
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
