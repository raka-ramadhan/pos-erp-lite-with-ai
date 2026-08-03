import { useState, useMemo, useEffect } from 'react';
import { Pencil, Trash2, RefreshCw, Eye } from 'lucide-react';
import { MasterPage } from '../../components/master/MasterPage';
import { MasterTable } from '../../components/master/MasterTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { UserModal } from './UserModal';
import { UserDetailModal } from './UserDetailModal';
import { useUsers, useDeleteUser, useChangeUserStatus } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { useHasPermission } from '../../hooks/usePermission';
import type { UserResponse } from '../../api/user.api';

export function UsersPage() {
  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'true' | 'false'>('');
  const [sort, setSort] = useState<'name' | 'email' | 'createdAt'>('createdAt');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [viewingUser, setViewingUser] = useState<UserResponse | null>(null);

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
    roleId: roleFilter || undefined,
  }), [page, debouncedSearch, sort, order, statusFilter, roleFilter]);

  // Queries
  const { data, isLoading, isFetching, refetch, error } = useUsers(params);
  const deleteUser = useDeleteUser();
  const changeStatus = useChangeUserStatus();
  const { data: rolesResponse } = useRoles();
  const roles = rolesResponse?.data || [];

  // Permissions
  const canCreate = useHasPermission('user.create');
  const canUpdate = useHasPermission('user.update');
  const canDelete = useHasPermission('user.delete');
  const canChangeStatus = useHasPermission('user.change_status');

  // Handlers
  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserResponse) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleView = (user: UserResponse) => {
    setViewingUser(user);
  };

  const handleDelete = async (user: UserResponse) => {
    if (window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      try {
        await deleteUser.mutateAsync(user.id);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleToggleStatus = async (user: UserResponse) => {
    try {
      await changeStatus.mutateAsync({ id: user.id, isActive: !user.isActive });
    } catch (error) {
      console.error('Failed to change status:', error);
    }
  };

  // Columns
  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (user: UserResponse) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: UserResponse) => (
        <Badge variant={user.role ? 'secondary' : 'warning'} size="sm">
          {user.role?.name || 'No Role'}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (user: UserResponse) => (
        canChangeStatus ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(user);
            }}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            style={{ backgroundColor: user.isActive ? '#22c55e' : '#94a3b8' }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                user.isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        ) : (
          <Badge variant={user.isActive ? 'success' : 'danger'} size="sm">
            {user.isActive ? 'Active' : 'Inactive'}
          </Badge>
        )
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (user: UserResponse) => (
        <span className="text-sm text-slate-500">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (user: UserResponse) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(user);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canUpdate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(user);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(user);
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <MasterPage
      title="User Management"
      subtitle="Manage application users"
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
      createLabel="Add User"
      canCreate={!!canCreate}
    >
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Select
            options={[
              { value: '', label: 'All Roles' },
              ...(roles?.map((role) => ({ value: role.id, label: role.name })) || []),
            ]}
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
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
              { value: 'createdAt:DESC', label: 'Newest First' },
              { value: 'createdAt:ASC', label: 'Oldest First' },
              { value: 'name:ASC', label: 'Name A-Z' },
              { value: 'name:DESC', label: 'Name Z-A' },
              { value: 'email:ASC', label: 'Email A-Z' },
              { value: 'email:DESC', label: 'Email Z-A' },
            ]}
            value={`${sort}:${order}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split(':');
              setSort(s as 'name' | 'email' | 'createdAt');
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
            <h3 className="text-lg font-medium text-slate-900 mb-2">Unable to load users</h3>
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
            emptyMessage="No users found"
            onRowClick={handleView}
          />

          {/* Pagination */}
          {data && data.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.meta.total)} of {data.meta.total} users
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
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
      />

      <UserDetailModal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        user={viewingUser}
      />
    </MasterPage>
  );
}
