import { useState, useMemo, useEffect } from 'react';
import { Pencil, Trash2, Shield, Eye, RefreshCw } from 'lucide-react';
import { MasterPage } from '../../components/master/MasterPage';
import { MasterTable } from '../../components/master/MasterTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { useRoles, useDeleteRole, useChangeRoleStatus } from '../../hooks/useRoles';
import { useHasPermission } from '../../hooks/usePermission';
import { RoleModal } from './RoleModal';
import { RoleDetailModal } from './RoleDetailModal';
import type { Role } from '../../types';

export function RolesPage() {
  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'true' | 'false'>('');
  const [sort, setSort] = useState<'name' | 'createdAt'>('name');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // API params
  const params = useMemo(() => ({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    sort,
    order,
    status: statusFilter ? statusFilter === 'true' : undefined,
  }), [page, debouncedSearch, sort, order, statusFilter]);

  // Queries
  const { data, isLoading, isFetching, refetch, error } = useRoles(params);
  const deleteRole = useDeleteRole();
  const changeStatus = useChangeRoleStatus();

  // Permissions
  const canCreate = useHasPermission('role.create');
  const canUpdate = useHasPermission('role.update');
  const canDelete = useHasPermission('role.delete');

  // Handlers
  const handleCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleView = (role: Role) => {
    setViewingRole(role);
    setIsDetailOpen(true);
  };

  const handleDelete = async (role: Role) => {
    const isAdmin = role.code === 'administrator' || role.name.toLowerCase() === 'administrator';

    if (isAdmin) {
      alert('Administrator role cannot be deleted.');
      return;
    }

    if (role.usersCount && role.usersCount > 0) {
      alert(`Cannot delete role "${role.name}" because it is assigned to ${role.usersCount} user(s).`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      try {
        await deleteRole.mutateAsync(role.id);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to delete role';
        alert(message);
      }
    }
  };

  const handleToggleStatus = async (role: Role) => {
    try {
      await changeStatus.mutateAsync({ id: role.id, isActive: !role.isActive });
    } catch (error) {
      console.error('Failed to change status:', error);
    }
  };

  // Columns
  const columns = [
    {
      key: 'name',
      header: 'Role',
      render: (role: Role) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{role.name}</p>
            <p className="text-xs text-slate-500 font-mono">{role.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (role: Role) => (
        <span className="text-sm text-slate-600 max-w-xs truncate block">
          {role.description || '-'}
        </span>
      ),
    },
    {
      key: 'usersCount',
      header: 'Users',
      render: (role: Role) => (
        <Badge variant="secondary" size="sm">
          {role.usersCount ?? 0}
        </Badge>
      ),
    },
    {
      key: 'permissionsCount',
      header: 'Permissions',
      render: (role: Role) => (
        <div className="flex flex-wrap gap-1">
          {role.permissions?.slice(0, 2).map((perm) => (
            <Badge key={perm.id} variant="outline" size="sm">
              {perm.code.split('.')[1]}
            </Badge>
          ))}
          {(role.permissionsCount ?? 0) > 2 && (
            <Badge variant="outline" size="sm">
              +{(role.permissionsCount ?? 0) - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (role: Role) =>
        canUpdate ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(role);
            }}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            style={{ backgroundColor: role.isActive ? '#22c55e' : '#94a3b8' }}
            title={role.isActive ? 'Click to deactivate' : 'Click to activate'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                role.isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        ) : (
          <Badge variant={role.isActive ? 'success' : 'danger'} size="sm">
            {role.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (role: Role) => (
        <span className="text-sm text-slate-500">
          {new Date(role.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (role: Role) => {
        const isAdmin = role.code === 'administrator' || role.name.toLowerCase() === 'administrator';
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView(role);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(role);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {canDelete && !isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(role);
                }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <MasterPage
      title="Role Management"
      subtitle="Manage user roles and their permissions"
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      }
      onCreate={canCreate ? handleCreate : undefined}
      createLabel="Add Role"
      canCreate={!!canCreate}
    >
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="search"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Select
            options={[
              { value: '', label: 'All Status' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as '' | 'true' | 'false');
              setPage(1);
            }}
          />
          <Select
            options={[
              { value: 'name:ASC', label: 'Name A-Z' },
              { value: 'name:DESC', label: 'Name Z-A' },
              { value: 'createdAt:DESC', label: 'Newest First' },
              { value: 'createdAt:ASC', label: 'Oldest First' },
            ]}
            value={`${sort}:${order}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split(':');
              setSort(s as 'name' | 'createdAt');
              setOrder(o as 'ASC' | 'DESC');
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Unable to load roles</h3>
            <p className="text-sm text-slate-500 mb-4">
              {error.message || 'You may not have permission to access this resource'}
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <>
          <MasterTable
            columns={columns}
            data={data?.data || []}
            keyField="id"
            emptyMessage="No roles found"
            onRowClick={handleView}
          />

          {/* Pagination */}
          {data && data.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.meta.total)} of {data.meta.total} roles
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-600">
                  Page {page} of {data.meta.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={editingRole}
      />

      <RoleDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        role={viewingRole}
        onEdit={handleEdit}
      />
    </MasterPage>
  );
}
