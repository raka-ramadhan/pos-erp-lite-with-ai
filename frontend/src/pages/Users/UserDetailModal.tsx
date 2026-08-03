import { X, Mail, Phone, Shield, Clock, User } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import type { UserResponse } from '../../api/user.api';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserResponse | null;
}

export function UserDetailModal({ isOpen, onClose, user }: UserDetailModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">User Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{user.name}</h3>
                <Badge variant={user.isActive ? 'success' : 'danger'} size="md">
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm text-slate-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm text-slate-900">{user.phone || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Role</p>
                  <p className="text-sm text-slate-900">
                    {user.role?.name || 'No Role Assigned'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">User ID</p>
                  <p className="text-sm text-slate-900 font-mono">{user.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="text-sm text-slate-900">
                    {new Date(user.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <p className="text-sm text-slate-900">
                    {new Date(user.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
