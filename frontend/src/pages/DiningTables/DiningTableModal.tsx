import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Select } from '../../components/ui/Select';
import { useCreateDiningTable, useUpdateDiningTable, useDistinctAreas } from '../../hooks/useDiningTables';
import type { DiningTableResponse, DiningTableStatus } from '../../api/dining-table.api';

const diningTableSchema = z.object({
  tableCode: z.string().min(1, 'Table code is required').max(20, 'Table code must be 20 characters or less'),
  tableName: z.string().min(1, 'Table name is required').max(100, 'Table name must be 100 characters or less'),
  areaName: z.string().max(100, 'Area name must be 100 characters or less').optional(),
  description: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(20, 'Capacity must be 20 or less').optional(),
  sortOrder: z.number().min(0, 'Sort order cannot be negative').optional(),
  isActive: z.boolean(),
  status: z.enum(['available', 'reserved', 'cleaning', 'inactive']),
});

type DiningTableFormData = z.infer<typeof diningTableSchema>;

interface DiningTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: DiningTableResponse | null;
}

export function DiningTableModal({ isOpen, onClose, table }: DiningTableModalProps) {
  const isEditing = !!table;
  const createTable = useCreateDiningTable();
  const updateTable = useUpdateDiningTable();
  const { data: areas } = useDistinctAreas();
  const isSubmitting = createTable.isPending || updateTable.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DiningTableFormData>({
    resolver: zodResolver(diningTableSchema),
    defaultValues: {
      tableCode: '',
      tableName: '',
      areaName: '',
      description: '',
      capacity: 4,
      sortOrder: 0,
      isActive: true,
      status: 'available' as DiningTableStatus,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (table) {
        reset({
          tableCode: table.tableCode,
          tableName: table.tableName,
          areaName: table.areaName || '',
          description: table.description || '',
          capacity: table.capacity,
          sortOrder: table.sortOrder,
          isActive: table.isActive,
          status: table.status,
        });
      } else {
        reset({
          tableCode: '',
          tableName: '',
          areaName: '',
          description: '',
          capacity: 4,
          sortOrder: 0,
          isActive: true,
          status: 'available' as DiningTableStatus,
        });
      }
    }
  }, [isOpen, table, reset]);

  const onSubmit = async (data: DiningTableFormData) => {
    try {
      const payload = {
        tableCode: data.tableCode,
        tableName: data.tableName,
        areaName: data.areaName || undefined,
        description: data.description || undefined,
        capacity: data.capacity ?? 4,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive,
        status: data.status,
      };

      if (isEditing && table) {
        updateTable.mutate(
          { id: table.id, data: payload },
          { onSuccess: () => onClose() }
        );
      } else {
        createTable.mutate(payload, {
          onSuccess: () => onClose(),
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  if (!isOpen) return null;

  // Area options from existing tables or allow custom
  const areaOptions = [
    { value: '', label: 'No Area' },
    ...(areas || []).map((area) => ({ value: area, label: area })),
  ];

  // Check if the current area value is custom (not in the list)
  const currentArea = watch('areaName') || '';
  const isCustomArea = currentArea && !(areas || []).includes(currentArea);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit Dining Table' : 'Create New Dining Table'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Section: General Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                General Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Table Code"
                  placeholder="e.g., T01"
                  error={errors.tableCode?.message}
                  {...register('tableCode')}
                />

                <Input
                  label="Table Name"
                  placeholder="e.g., Table 1"
                  error={errors.tableName?.message}
                  {...register('tableName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Enter table description (optional)"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Section: Location */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Location
              </h3>

              <Select
                label="Area"
                options={areaOptions}
                value={isCustomArea ? '' : currentArea}
                onChange={(e) => setValue('areaName', e.target.value)}
              />

              {isCustomArea && (
                <Input
                  label="Custom Area Name"
                  placeholder="Enter new area name"
                  value={currentArea}
                  onChange={(e) => setValue('areaName', e.target.value)}
                />
              )}

              {/* Quick add area hint */}
              <p className="text-xs text-slate-500">
                Select an existing area or type a new one
              </p>
            </div>

            {/* Section: Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Configuration
              </h3>

              <Input
                label="Capacity (Seats)"
                type="number"
                min={1}
                max={20}
                placeholder="4"
                error={errors.capacity?.message}
                {...register('capacity', { valueAsNumber: true })}
              />
            </div>

            {/* Section: Display */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Display
              </h3>

              <Input
                label="Sort Order"
                type="number"
                min={0}
                placeholder="0"
                error={errors.sortOrder?.message}
                {...register('sortOrder', { valueAsNumber: true })}
              />
            </div>

            {/* Section: Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Status
              </h3>

              <Select
                label="Table Status"
                options={[
                  { value: 'available', label: 'Available' },
                  { value: 'reserved', label: 'Reserved' },
                  { value: 'cleaning', label: 'Cleaning' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                value={watch('status')}
                onChange={(e) => setValue('status', e.target.value as DiningTableStatus)}
              />

              <Checkbox
                label="Active"
                checked={watch('isActive')}
                onChange={(e) => setValue('isActive', e.target.checked)}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="secondary" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={isSubmitting}>
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
