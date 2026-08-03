import { useState, useMemo, useEffect } from 'react';
import { Key, RefreshCw, Plus, Search, ChevronRight, Shield, Users, Grid3X3, X } from 'lucide-react';
import { MasterPage } from '../../components/master/MasterPage';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import {
  usePermissionsGrouped,
  useDeletePermission,
  usePermissionDetail,
} from '../../hooks/usePermissions';
import { useHasPermission } from '../../hooks/usePermission';
import { PermissionModal } from './PermissionModal';
import type { Permission } from '../../types';

// Module stats interface
interface ModuleStats {
  name: string;
  totalPermissions: number;
  activePermissions: number;
  totalRoles: number;
}

export function PermissionsPage() {
  // State
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Queries
  const { data: groupedData, isLoading: isLoadingGrouped } = usePermissionsGrouped();
  const deletePermission = useDeletePermission();

  // Permissions
  const canCreate = useHasPermission('permission.create');
  const canUpdate = useHasPermission('permission.update');
  const canDelete = useHasPermission('permission.delete');

  // Calculate module stats
  const moduleStats = useMemo<ModuleStats[]>(() => {
    if (!groupedData) return [];

    return groupedData.map((group) => ({
      name: group.group,
      totalPermissions: group.permissions.length,
      activePermissions: group.permissions.filter((p) => p.isActive).length,
      totalRoles: group.permissions.reduce((sum, p) => sum + (p.rolesCount || 0), 0),
    }));
  }, [groupedData]);

  // Filter permissions for selected module
  const filteredPermissions = useMemo(() => {
    if (!groupedData) return [];

    let permissions: Permission[] = [];

    if (selectedModule) {
      const module = groupedData.find((g) => g.group === selectedModule);
      permissions = module?.permissions || [];
    } else {
      // Show all permissions
      permissions = groupedData.flatMap((g) => g.permissions);
    }

    // Apply search filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      permissions = permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.code.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter === 'active') {
      permissions = permissions.filter((p) => p.isActive);
    } else if (statusFilter === 'inactive') {
      permissions = permissions.filter((p) => !p.isActive);
    }

    return permissions;
  }, [groupedData, selectedModule, debouncedSearch, statusFilter]);

  // Handlers
  const handleModuleClick = (moduleName: string) => {
    setSelectedModule(moduleName === selectedModule ? null : moduleName);
  };

  const handlePermissionClick = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDetailOpen(true);
  };

  const handleEdit = (permission: Permission, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingPermission(permission);
    setIsModalOpen(true);
  };

  const handleDelete = async (permission: Permission, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (permission.rolesCount && permission.rolesCount > 0) {
      alert(`Cannot delete permission "${permission.name}" because it is used by ${permission.rolesCount} role(s).`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete permission "${permission.name}"?`)) {
      try {
        await deletePermission.mutateAsync(permission.id);
        if (selectedPermission?.id === permission.id) {
          setIsDetailOpen(false);
          setSelectedPermission(null);
        }
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to delete permission';
        alert(message);
      }
    }
  };

  const handleCreate = () => {
    setEditingPermission(null);
    setIsModalOpen(true);
  };

  return (
    <MasterPage
      title="Permission Management"
      subtitle="Manage application permissions and access control"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          {canCreate && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Permission
            </Button>
          )}
        </div>
      }
      canCreate={!!canCreate}
    >
      <div className="flex gap-6 h-[calc(100vh-220px)]">
        {/* Left Panel - Module List */}
        <div className="w-72 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Modules
            </h3>
            <p className="text-xs text-slate-500 mt-1">{moduleStats.length} modules</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {/* All Modules option */}
            <button
              onClick={() => setSelectedModule(null)}
              className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                selectedModule === null
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">All Permissions</span>
                <Badge variant={selectedModule === null ? 'info' : 'secondary'} size="sm">
                  {groupedData?.reduce((sum, g) => sum + g.permissions.length, 0) || 0}
                </Badge>
              </div>
            </button>

            {/* Module list */}
            {isLoadingGrouped ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
              </div>
            ) : (
              moduleStats.map((module) => (
                <button
                  key={module.name}
                  onClick={() => handleModuleClick(module.name)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                    selectedModule === module.name
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{module.name}</span>
                    <Badge
                      variant={selectedModule === module.name ? 'info' : 'secondary'}
                      size="sm"
                    >
                      {module.totalPermissions}
                    </Badge>
                  </div>
                  {selectedModule === module.name && (
                    <div className="mt-2 flex gap-3 text-xs">
                      <span className="text-green-600">{module.activePermissions} active</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{module.totalRoles} roles</span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Permission List */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search permissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Count */}
              <span className="text-sm text-slate-500">
                {filteredPermissions.length} permissions
              </span>
            </div>

            {/* Module breadcrumb */}
            {selectedModule && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <button
                  onClick={() => setSelectedModule(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  All
                </button>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-900">{selectedModule}</span>
              </div>
            )}
          </div>

          {/* Permission Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoadingGrouped ? (
              <div className="flex items-center justify-center h-full">
                <Spinner size="lg" />
              </div>
            ) : filteredPermissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Key className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No permissions found</h3>
                <p className="text-sm text-slate-500">
                  {debouncedSearch || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create a new permission to get started'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPermissions.map((permission) => (
                  <PermissionCard
                    key={permission.id}
                    permission={permission}
                    isSelected={selectedPermission?.id === permission.id}
                    onClick={() => handlePermissionClick(permission)}
                    onEdit={(e) => handleEdit(permission, e)}
                    onDelete={(e) => handleDelete(permission, e)}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permission Modal */}
      <PermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        permission={editingPermission}
      />

      {/* Detail Drawer */}
      <PermissionDetailDrawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        permission={selectedPermission}
        onEdit={handleEdit}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </MasterPage>
  );
}

// Permission Card Component
interface PermissionCardProps {
  permission: Permission;
  isSelected: boolean;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

function PermissionCard({
  permission,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: PermissionCardProps) {
  const action = permission.code.split('.')[1] || '';
  const module = permission.group || 'Other';

  return (
    <div
      onClick={onClick}
      className={`p-4 border rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'border-indigo-300 bg-indigo-50'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Key className="w-4 h-4 text-indigo-600" />
          </div>
          <Badge variant="secondary" size="sm">
            {module}
          </Badge>
        </div>
        <Badge variant={permission.isActive ? 'success' : 'danger'} size="sm">
          {permission.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <h4 className="font-medium text-slate-900 mb-1">{permission.name}</h4>
      <p className="text-xs font-mono text-indigo-600 mb-2">{permission.code}</p>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="capitalize">{action}</span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {permission.rolesCount || 0} roles
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
        {canUpdate && (
          <button
            onClick={onEdit}
            className="flex-1 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Edit
          </button>
        )}
        {canDelete && (
          <button
            onClick={onDelete}
            className="flex-1 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// Permission Detail Drawer
interface PermissionDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  onEdit: (permission: Permission, e?: React.MouseEvent) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

function PermissionDetailDrawer({
  isOpen,
  onClose,
  permission,
  onEdit,
  canUpdate,
  canDelete,
}: PermissionDetailDrawerProps) {
  const { data: detail, isLoading } = usePermissionDetail(permission?.id || null);

  if (!isOpen || !permission) return null;

  const action = permission.code.split('.')[1] || '';
  const module = permission.group || 'Other';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Key className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{permission.name}</h2>
              <p className="text-sm text-slate-500 font-mono">{permission.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={permission.isActive ? 'success' : 'danger'} size="sm">
              {permission.isActive ? 'Active' : 'Inactive'}
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
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Permission Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500">Module</label>
                    <p className="text-sm font-medium text-slate-900">{module}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Action</label>
                    <p className="text-sm font-medium text-slate-900 capitalize">{action}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500">Description</label>
                    <p className="text-sm text-slate-900">{permission.description || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                    <Key className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">1</p>
                  <p className="text-xs text-slate-500">Permission</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {detail?.roles?.length || permission.rolesCount || 0}
                  </p>
                  <p className="text-xs text-slate-500">Roles</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {detail?.roles?.reduce((sum, r) => sum + r.usersCount, 0) || 0}
                  </p>
                  <p className="text-xs text-slate-500">Users</p>
                </div>
              </div>

              {/* Roles Using This Permission */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Roles with this Permission
                </h3>
                {detail?.roles && detail.roles.length > 0 ? (
                  <div className="space-y-2">
                    {detail.roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{role.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{role.code}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">{role.usersCount}</p>
                          <p className="text-xs text-slate-500">users</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg">
                    No roles assigned
                  </p>
                )}
              </div>

              {/* Menus Using This Permission */}
              {detail?.menus && detail.menus.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Related Menus</h3>
                  <div className="flex flex-wrap gap-2">
                    {detail.menus.map((menu) => (
                      <Badge key={menu.id} variant="outline" size="sm">
                        {menu.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Timeline</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500">Created</label>
                    <p className="text-sm text-slate-900">
                      {new Date(permission.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Last Updated</label>
                    <p className="text-sm text-slate-900">
                      {new Date(permission.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 px-6 py-4 border-t border-slate-200">
          <div>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => {
                  // This will be handled by parent
                }}
                disabled={!!(permission.rolesCount && permission.rolesCount > 0)}
              >
                Delete Permission
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            {canUpdate && (
              <Button
                variant="primary"
                onClick={(e) => onEdit(permission, e)}
              >
                Edit Permission
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
