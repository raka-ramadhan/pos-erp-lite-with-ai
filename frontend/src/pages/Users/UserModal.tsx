import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Checkbox } from '../../components/ui/Checkbox';
import { Select } from '../../components/ui/Select';
import { useCreateUser, useUpdateUser } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import type { UserResponse } from '../../api/user.api';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  roleId: string;
  isActive: boolean;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserResponse | null;
}

export function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const isEditing = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { data: rolesResponse } = useRoles();
  const roles = rolesResponse?.data || [];

  const isSubmitting = createUser.isPending || updateUser.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      roleId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          password: '',
          phone: user.phone || '',
          roleId: user.role?.id || '',
          isActive: user.isActive,
        });
      } else {
        reset({
          name: '',
          email: '',
          password: '',
          phone: '',
          roleId: '',
          isActive: true,
        });
      }
    }
  }, [isOpen, user, reset]);

  const onSubmit = (data: UserFormData) => {
    const payload: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      roleId: data.roleId || undefined,
      isActive: data.isActive,
    };

    if (isEditing && user) {
      if (data.password) {
        payload.password = data.password;
      }
      updateUser.mutate(
        { id: user.id, data: payload as { name?: string; email?: string; password?: string; phone?: string; roleId?: string; isActive?: boolean } },
        {
          onSuccess: () => onClose(),
        }
      );
    } else {
      createUser.mutate(
        { ...payload, password: data.password } as { name: string; email: string; password: string; phone?: string; roleId?: string; isActive?: boolean },
        {
          onSuccess: () => onClose(),
        }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit User' : 'Create New User'}
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
            <Input
              label="Full Name"
              placeholder="Enter full name"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter email address"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />

            <PasswordInput
              label={isEditing ? 'Password (leave blank to keep current)' : 'Password'}
              placeholder={isEditing ? 'Enter new password' : 'Enter password'}
              error={errors.password?.message}
              {...register('password', isEditing ? {} : {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' }
              })}
            />

            <Input
              label="Phone"
              type="tel"
              placeholder="Enter phone number"
              {...register('phone')}
            />

            <Select
              label="Role"
              options={[
                { value: '', label: 'Select role' },
                ...(roles?.map((role) => ({ value: role.id, label: role.name })) || []),
              ]}
              value={watch('roleId')}
              onChange={(e) => setValue('roleId', e.target.value)}
            />

            <Checkbox
              label="Active"
              checked={watch('isActive')}
              onChange={(e) => setValue('isActive', e.target.checked)}
            />

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
