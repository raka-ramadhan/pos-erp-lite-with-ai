import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Select } from '../../components/ui/Select';
import { useCreatePermission, useUpdatePermission, useModules } from '../../hooks/usePermissions';
import type { Permission } from '../../types';

const permissionSchema = z.object({
  name: z.string()
    .min(1, 'Permission name is required')
    .max(100, 'Name must be less than 100 characters'),
  code: z.string()
    .min(1, 'Permission code is required')
    .regex(/^[a-z_]+\.[a-z_]+$/, 'Code must be in format: module.action (e.g., user.view)'),
  description: z.string().optional(),
  group: z.string()
    .min(1, 'Module is required'),
  isActive: z.boolean(),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
}

export function PermissionModal({ isOpen, onClose, permission }: PermissionModalProps) {
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const { data: modules } = useModules();

  const isEditing = !!permission;
  const isSubmitting = createPermission.isPending || updatePermission.isPending;

  // Check if permission is used by any roles
  const isUsedByRoles = !!(permission && permission.rolesCount && permission.rolesCount > 0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      group: '',
      isActive: true,
    },
  });

  const selectedModule = watch('group');

  useEffect(() => {
    if (isOpen) {
      if (permission) {
        reset({
          name: permission.name,
          code: permission.code,
          description: permission.description || '',
          group: permission.group,
          isActive: permission.isActive,
        });
      } else {
        reset({
          name: '',
          code: '',
          description: '',
          group: '',
          isActive: true,
        });
      }
    }
  }, [isOpen, permission, reset]);

  const onSubmit = async (data: PermissionFormData) => {
    try {
      if (isEditing && permission) {
        // If permission is used by roles, only allow editing name, description, isActive
        const updateData: any = {
          name: data.name,
          description: data.description,
          isActive: data.isActive,
        };

        // Only include code and group if not used by roles
        if (!isUsedByRoles) {
          updateData.code = data.code;
          updateData.group = data.group;
        }

        await updatePermission.mutateAsync({
          id: permission.id,
          data: updateData,
        });
      } else {
        await createPermission.mutateAsync({
          name: data.name,
          code: data.code,
          description: data.description,
          group: data.group,
          isActive: data.isActive,
        });
      }
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to save permission';
      alert(message);
    }
  };

  if (!isOpen) return null;

  const moduleOptions = modules?.map((m) => ({ value: m, label: m })) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit Permission' : 'Create New Permission'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {isUsedByRoles && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                ⚠️ This permission is used by {permission.rolesCount} role(s). Only name, description, and status can be edited.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  label="Module"
                  options={[
                    { value: '', label: 'Select module' },
                    ...moduleOptions,
                  ]}
                  value={selectedModule || ''}
                  onChange={(e) => setValue('group', e.target.value)}
                  error={errors.group?.message}
                  disabled={isUsedByRoles}
                />
              </div>
              <div className="flex items-end">
                <Checkbox
                  label="Active"
                  {...register('isActive')}
                />
              </div>
            </div>

            <Input
              label="Permission Code"
              placeholder="e.g. user.view"
              error={errors.code?.message}
              disabled={isUsedByRoles}
              {...register('code')}
            />
            <p className="text-xs text-slate-500 -mt-2">
              {isUsedByRoles
                ? '🔒 Code cannot be changed because this permission is used by roles'
                : 'Format: module.action (lowercase, separated by dot)'}
            </p>

            <Input
              label="Permission Name"
              placeholder="e.g. View Users"
              error={errors.name?.message}
              {...register('name')}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                placeholder="Enter permission description (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="secondary" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
              >
                {isEditing ? 'Update Permission' : 'Create Permission'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
