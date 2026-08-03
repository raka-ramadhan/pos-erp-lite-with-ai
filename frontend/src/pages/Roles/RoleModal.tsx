import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { useCreateRole, useUpdateRole } from '../../hooks/useRoles';
import { usePermissionsGrouped } from '../../hooks/usePermissions';
import type { Role } from '../../types';

const roleSchema = z.object({
  code: z.string()
    .min(1, 'Role code is required')
    .regex(/^[a-z_]+$/, 'Code must be lowercase letters and underscores only'),
  name: z.string()
    .min(1, 'Role name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  isActive: z.boolean(),
  permissionIds: z.array(z.string()).min(1, 'At least one permission is required'),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

export function RoleModal({ isOpen, onClose, role }: RoleModalProps) {
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const { data: permissions } = usePermissionsGrouped();

  const isEditing = !!role;
  const isSubmitting = createRole.isPending || updateRole.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      isActive: true,
      permissionIds: [],
    },
  });

  const selectedPermissions = watch('permissionIds');

  useEffect(() => {
    if (isOpen) {
      if (role) {
        reset({
          code: role.code || '',
          name: role.name,
          description: role.description || '',
          isActive: role.isActive,
          permissionIds: role.permissions?.map((p) => p.id) || [],
        });
      } else {
        reset({
          code: '',
          name: '',
          description: '',
          isActive: true,
          permissionIds: [],
        });
      }
    }
  }, [isOpen, role, reset]);

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (isEditing && role) {
        await updateRole.mutateAsync({
          id: role.id,
          data: {
            code: data.code,
            name: data.name,
            description: data.description,
            isActive: data.isActive,
            permissionIds: data.permissionIds,
          },
        });
      } else {
        await createRole.mutateAsync({
          code: data.code,
          name: data.name,
          description: data.description,
          isActive: data.isActive,
          permissionIds: data.permissionIds,
        });
      }
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to save role';
      alert(message);
    }
  };

  const togglePermission = (permissionId: string) => {
    const current = selectedPermissions || [];
    if (current.includes(permissionId)) {
      setValue('permissionIds', current.filter((id) => id !== permissionId));
    } else {
      setValue('permissionIds', [...current, permissionId]);
    }
  };

  const toggleAllInGroup = (groupPermissions: { id: string }[]) => {
    const groupIds = groupPermissions.map((p) => p.id);
    const allSelected = groupIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      setValue('permissionIds', selectedPermissions.filter((id) => !groupIds.includes(id)));
    } else {
      const newPermissions = [...new Set([...selectedPermissions, ...groupIds])];
      setValue('permissionIds', newPermissions);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit Role' : 'Create New Role'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Role Code"
                  placeholder="e.g. role_manager"
                  error={errors.code?.message}
                  disabled={isEditing}
                  {...register('code')}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Unique identifier, lowercase with underscores
                </p>
              </div>
              <div className="flex items-end">
                <Checkbox
                  label="Active"
                  {...register('isActive')}
                />
              </div>
            </div>

            <div>
              <Input
                label="Role Name"
                placeholder="Enter role name"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div>
              <Input
                label="Description"
                placeholder="Enter role description"
                {...register('description')}
              />
            </div>

            {/* Permissions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700">
                  Permissions
                </label>
                {errors.permissionIds && (
                  <span className="text-sm text-red-500">{errors.permissionIds.message}</span>
                )}
              </div>
              <div className="space-y-4 max-h-80 overflow-y-auto border border-slate-200 rounded-lg p-4">
                {permissions?.map((group) => {
                  const groupIds = group.permissions.map((p) => p.id);
                  const allSelected = groupIds.every((id) => selectedPermissions.includes(id));
                  const someSelected = groupIds.some((id) => selectedPermissions.includes(id));

                  return (
                    <div key={group.group} className="border border-slate-100 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someSelected && !allSelected;
                          }}
                          onChange={() => toggleAllInGroup(group.permissions)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <h4 className="text-sm font-medium text-slate-700">
                          {group.group}
                        </h4>
                        <span className="text-xs text-slate-400">
                          ({group.permissions.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 ml-6">
                        {group.permissions.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-600 flex-1">
                              {perm.name}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {perm.code.split('.')[1]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Selected: {selectedPermissions.length} permissions
              </p>
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
                {isEditing ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
