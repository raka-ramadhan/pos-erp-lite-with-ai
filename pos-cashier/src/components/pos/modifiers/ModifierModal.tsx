import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Plus, Minus, Loader2 } from 'lucide-react';
import { Button } from '../../ui';
import { cn } from '../../../utils';
import type { ProductWithModifiers, ModifierGroup, Modifier } from '../../../types';

interface ModifierModalProps {
  product: ProductWithModifiers | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToOrder: (productId: string, quantity: number, unitPrice: number, modifiers: SelectedModifierPayload[]) => Promise<void>;
  isAdding?: boolean;
}

interface SelectedModifierPayload {
  modifierId: string;
  modifierName: string;
  quantity: number;
  unitPrice: number;
}

interface SelectionState {
  [groupId: string]: string[]; // For single select: single value or array for multiple
}

export function ModifierModal({
  product,
  isOpen,
  onClose,
  onAddToOrder,
  isAdding = false,
}: ModifierModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<SelectionState>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset state when modal opens with new product
  useMemo(() => {
    if (product) {
      // Initialize selections with default values
      const defaults: SelectionState = {};
      product.modifierGroups.forEach((group) => {
        const defaultModifiers = group.modifiers.filter((m) => m.isDefault);
        if (defaultModifiers.length > 0) {
          defaults[group.id] = defaultModifiers.map((m) => m.id);
        } else {
          defaults[group.id] = [];
        }
      });
      setSelections(defaults);
      setQuantity(1);
      setValidationError(null);
    }
  }, [product]);

  // Calculate totals
  const { modifierTotal, itemTotal } = useMemo(() => {
    if (!product) return { modifierTotal: 0, itemTotal: 0 };

    let modTotal = 0;
    Object.entries(selections).forEach(([groupId, modifierIds]) => {
      const group = product.modifierGroups.find((g) => g.id === groupId);
      if (group) {
        modifierIds.forEach((modId) => {
          const modifier = group.modifiers.find((m) => m.id === modId);
          if (modifier) {
            modTotal += modifier.additionalPrice;
          }
        });
      }
    });

    const total = (product.price + modTotal) * quantity;
    return { modifierTotal: modTotal, itemTotal: total };
  }, [product, selections, quantity]);

  // Validate selections
  const validateSelections = useCallback((): string | null => {
    if (!product) return null;

    for (const group of product.modifierGroups) {
      const selected = selections[group.id] || [];

      // Check required groups
      if (group.isRequired && selected.length === 0) {
        return `${group.name} wajib dipilih`;
      }

      // Check min selections
      if (group.minSelections && selected.length < group.minSelections) {
        return `${group.name} minimal pilih ${group.minSelections} item`;
      }

      // Check max selections
      if (group.maxSelections && selected.length > group.maxSelections) {
        return `${group.name} maksimal pilih ${group.maxSelections} item`;
      }
    }

    return null;
  }, [product, selections]);

  // Handle modifier selection
  const handleModifierSelect = useCallback(
    (group: ModifierGroup, modifierId: string) => {
      setValidationError(null);
      setSelections((prev) => {
        const current = prev[group.id] || [];
        let newSelection: string[];

        if (group.selectionType === 'single') {
          // Single selection: replace
          newSelection = current.includes(modifierId) ? [] : [modifierId];
        } else {
          // Multiple selection: toggle
          if (current.includes(modifierId)) {
            newSelection = current.filter((id) => id !== modifierId);
          } else {
            // Check max selections
            if (group.maxSelections && current.length >= group.maxSelections) {
              setValidationError(`${group.name} maksimal pilih ${group.maxSelections} item`);
              return prev;
            }
            newSelection = [...current, modifierId];
          }
        }

        return { ...prev, [group.id]: newSelection };
      });
    },
    []
  );

  // Handle add to order
  const handleAddToOrder = useCallback(async () => {
    const error = validateSelections();
    if (error) {
      setValidationError(error);
      return;
    }

    if (!product) return;

    // Build modifiers payload
    const modifiersPayload: SelectedModifierPayload[] = [];
    Object.entries(selections).forEach(([groupId, modifierIds]) => {
      const group = product.modifierGroups.find((g) => g.id === groupId);
      if (group) {
        modifierIds.forEach((modId) => {
          const modifier = group.modifiers.find((m) => m.id === modId);
          if (modifier) {
            modifiersPayload.push({
              modifierId: modifier.id,
              modifierName: modifier.name,
              quantity: 1,
              unitPrice: modifier.additionalPrice,
            });
          }
        });
      }
    });

    await onAddToOrder(product.id, quantity, product.price, modifiersPayload);
  }, [product, quantity, selections, validateSelections, onAddToOrder]);

  // Handle quantity change
  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  }, []);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:w-full sm:max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="text-lg font-bold text-slate-900 truncate">
                    {product.name}
                  </h2>
                  <p className="text-sm text-amber-600 font-medium">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Modifier Groups */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {product.modifierGroups.map((group) => (
                <ModifierGroupSection
                  key={group.id}
                  group={group}
                  selectedIds={selections[group.id] || []}
                  onSelect={(modifierId) => handleModifierSelect(group, modifierId)}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-slate-100 bg-slate-50">
              {/* Validation Error */}
              {validationError && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Quantity & Price */}
              <div className="flex items-center justify-between mb-4">
                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                      quantity <= 1
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    )}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold text-slate-900 w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Total */}
                <div className="text-right">
                  {modifierTotal > 0 && (
                    <p className="text-xs text-slate-500">
                      + Rp {modifierTotal.toLocaleString('id-ID')} modifier
                    </p>
                  )}
                  <p className="text-xl font-bold text-amber-600">
                    Rp {itemTotal.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Add Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToOrder}
                disabled={isAdding}
                leftIcon={isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              >
                {isAdding ? 'Menambahkan...' : `Tambah ${quantity} Item`}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Modifier Group Section Component
interface ModifierGroupSectionProps {
  group: ModifierGroup;
  selectedIds: string[];
  onSelect: (modifierId: string) => void;
}

function ModifierGroupSection({
  group,
  selectedIds,
  onSelect,
}: ModifierGroupSectionProps) {
  const isSingle = group.selectionType === 'single';

  return (
    <div className="bg-slate-50 rounded-xl p-4">
      {/* Group Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900">{group.name}</h3>
          {group.isRequired && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded">
              Wajib
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">
          {isSingle ? 'Pilih 1' : `Pilih ${group.minSelections || 0}-${group.maxSelections || 'banyak'}`}
        </span>
      </div>

      {/* Modifiers List */}
      <div className="space-y-2">
        {group.modifiers.map((modifier) => {
          const isSelected = selectedIds.includes(modifier.id);
          const hasAdditionalPrice = modifier.additionalPrice > 0;

          return (
            <button
              key={modifier.id}
              onClick={() => onSelect(modifier.id)}
              className={cn(
                'w-full flex items-center justify-between p-3 rounded-lg transition-all text-left',
                isSelected
                  ? 'bg-amber-500 text-white'
                  : 'bg-white hover:bg-slate-100'
              )}
            >
              <div className="flex items-center gap-3">
                {/* Selection Indicator */}
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected
                      ? 'border-white bg-white'
                      : isSingle
                      ? 'border-slate-300'
                      : 'border-slate-300'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-amber-500" />}
                </div>
                <span
                  className={cn(
                    'font-medium',
                    isSelected ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {modifier.name}
                </span>
                {modifier.isDefault && !isSelected && (
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-xs rounded">
                    Default
                  </span>
                )}
              </div>
              {hasAdditionalPrice && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-white/80' : 'text-amber-600'
                  )}
                >
                  + Rp {modifier.additionalPrice.toLocaleString('id-ID')}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { SelectedModifierPayload };
