import { X, Users, Shield, Calendar, Key } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { Role } from '../../types';

interface RoleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onEdit: (role: Role) => void;
}

export function RoleDetailModal({ isOpen, onClose, role, onEdit }: RoleDetailModalProps) {
  if (!isOpen || !role) return null;

  // Group permissions by module
  const groupedPermissions = role.permissions?.reduce((acc, perm) => {
    const group = perm.group || 'Other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(perm);
    return acc;
  }, {} as Record<string, typeof role.permissions>) || {};

  // Create permission matrix
  const permissionMatrix = Object.entries(groupedPermissions).map(([group, perms]) => {
    const actions = perms.map((p) => {
      // Handle both formats: module.action and module_action
      if (p.code.includes('.')) {
        return p.code.split('.')[1];
      } else if (p.code.includes('_')) {
        return p.code.split('_')[0]; // Fixed: [0] to get action (view, create, etc), not resource
      }
      return p.code; // fallback
    });
    return {
      module: group,
      actions,
      permissions: perms,
    };
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{role.name}</h2>
                <p className="text-sm text-slate-500 font-mono">{role.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={role.isActive ? 'success' : 'danger'} size="sm">
                {role.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Role Information */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
                  Role Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500">Role Code</label>
                    <p className="text-sm font-mono text-slate-900">{role.code}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Description</label>
                    <p className="text-sm text-slate-900">{role.description || '-'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500">Status</label>
                    <Badge variant={role.isActive ? 'success' : 'danger'} size="sm">
                      {role.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
                  Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Users className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-2xl font-semibold text-slate-900">
                        {role.usersCount ?? 0}
                      </p>
                      <p className="text-xs text-slate-500">Users</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Key className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-2xl font-semibold text-slate-900">
                        {role.permissionsCount ?? role.permissions?.length ?? 0}
                      </p>
                      <p className="text-xs text-slate-500">Permissions</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-4 h-4" />
                  Created: {new Date(role.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-4 h-4" />
                  Updated: {new Date(role.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Permission Matrix */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
                Permission Matrix
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-medium text-slate-700 w-32">
                        Module
                      </th>
                      {['View', 'Create', 'Update', 'Delete'].map((action) => (
                        <th
                          key={action}
                          className="text-center py-2 px-3 font-medium text-slate-700 w-20"
                        >
                          {action}
                        </th>
                      ))}
                      {permissionMatrix.some((m) => m.actions.includes('change_status')) && (
                        <th className="text-center py-2 px-3 font-medium text-slate-700 w-24">
                          Change Status
                        </th>
                      )}
                      {permissionMatrix.some((m) => m.actions.includes('export')) && (
                        <th className="text-center py-2 px-3 font-medium text-slate-700 w-20">
                          Export
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {permissionMatrix.map(({ module, actions }) => {
                      const actionSet = new Set(actions.map((a) => a.toLowerCase()));
                      return (
                        <tr key={module} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-700">{module}</td>
                          <td className="text-center py-2 px-3">
                            {actionSet.has('view') ? (
                              <span className="text-green-600 text-lg">✓</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-3">
                            {actionSet.has('create') ? (
                              <span className="text-green-600 text-lg">✓</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-3">
                            {actionSet.has('update') ? (
                              <span className="text-green-600 text-lg">✓</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-3">
                            {actionSet.has('delete') ? (
                              <span className="text-green-600 text-lg">✓</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          {permissionMatrix.some((m) => m.actions.includes('change_status')) && (
                            <td className="text-center py-2 px-3">
                              {actionSet.has('change_status') ? (
                                <span className="text-green-600 text-lg">✓</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          )}
                          {permissionMatrix.some((m) => m.actions.includes('export')) && (
                            <td className="text-center py-2 px-3">
                              {actionSet.has('export') ? (
                                <span className="text-green-600 text-lg">✓</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Permission List */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">
                Assigned Permissions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {role.permissions?.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                  >
                    <Key className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {perm.name}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">{perm.code}</p>
                    </div>
                  </div>
                ))}
              </div>
              {(!role.permissions || role.permissions.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No permissions assigned
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" onClick={() => onEdit(role)}>
              Edit Role
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
