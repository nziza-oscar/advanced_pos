// app/admin/users/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Ban, 
  CheckCircle,
  Users,
  Mail,
  UserCircle,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  AlertCircle,
  Edit,
  Shield,
  Clock
} from 'lucide-react';
import { useUsers, useIsLoading, useAdminActions, usePagination, useSearchQuery, useFilters } from '@/lib/store/adminSelectors';
import { useModal } from '@/components/ui/ModalManager';
import { CreateUserModal } from '@/components/ui/modals/CreateUserModal';
import { UserDetailsModal } from '@/components/ui/modals/UserDetailsModal';
import { EditUserModal } from '@/components/ui/modals/EditUserModal';

export default function UsersPage() {
  const users = useUsers();
  const isLoading = useIsLoading();
  const pagination = usePagination();
  const searchQuery = useSearchQuery();
  const filters = useFilters();
 const { openModal } = useModal();
  const handleCreateUser = () => {
    openModal({
      title: 'Create New User',
      content: <CreateUserModal />,
      size: 'md'
    });
  };

  const handleViewUser = (userId: string) => {
    openModal({
      title: 'User Details',
      content: <UserDetailsModal userId={userId} />,
      size: 'lg'
    });
  };

  const { 
    fetchUsers, 
    deleteUser,
    suspendUser,
    activateUser,
    setSearchQuery,
    setPagination,
    setFilters,
  } = useAdminActions();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    role: '',
    status: '',
    tenant_id: ''
  });
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
    
  }, [pagination.page, pagination.limit, searchQuery, localFilters.role, localFilters.status, localFilters.tenant_id]);

 

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination({ page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ page: newPage });
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    setPagination({ page: 1 });
    setShowFiltersPanel(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({ role: '', status: '', tenant_id: '' });
    setFilters({});
    setPagination({ page: 1 });
    setShowFiltersPanel(false);
  };

  const handleDelete = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    }
  };

  const handleSuspend = async () => {
    if (selectedUser) {
      await suspendUser(selectedUser.id);
      setShowSuspendModal(false);
      setSelectedUser(null);
      fetchUsers();
    }
  };

  const handleActivate = async (userId: string) => {
    await activateUser(userId);
    fetchUsers();
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      super_admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      tenant_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      cashier: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inventory_manager: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    };
    return styles[role] || styles.cashier;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (isLoading && !users.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  const hasActiveFilters = localFilters.role || localFilters.status || localFilters.tenant_id;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">Manage all system users across tenants</p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/users/create'}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name, email, or username..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
              {(localFilters.role ? 1 : 0) + (localFilters.status ? 1 : 0) + (localFilters.tenant_id ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFiltersPanel && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button
              onClick={handleClearFilters}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <select
              value={localFilters.role}
              onChange={(e) => setLocalFilters({ ...localFilters, role: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="tenant_admin">Tenant Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
              <option value="inventory_manager">Inventory Manager</option>
            </select>
            <select
              value={localFilters.status}
              onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={localFilters.tenant_id}
              onChange={(e) => setLocalFilters({ ...localFilters, tenant_id: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="">All Tenants</option>
              {tenants.map((tenant: any) => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowFiltersPanel(false)}
              className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tenant</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Last Login</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Created</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
         <tbody>
  {users.length === 0 ? (
    <tr>
      <td colSpan={7} className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No users found</p>
      </td>
    </tr>
  ) : (
    users.map((user: any) => (
      <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{user.full_name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{user.email}</span>
              </div>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
            <Shield className="h-3 w-3" />
            {formatRole(user.role)}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="text-sm text-foreground">
            {user.tenant?.name || 'System'}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.is_active)}`}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {user.last_login 
                ? new Date(user.last_login).toLocaleDateString()
                : 'Never'}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                openModal({
                  title: 'User Details',
                  content: <UserDetailsModal userId={user.id} />,
                  size: 'lg'
                });
              }}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                openModal({
                  title: 'Edit User',
                  content: <EditUserModal userId={user.id} />,
                  size: 'md'
                });
              }}
              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-600"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            {user.is_active ? (
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowSuspendModal(true);
                }}
                className="p-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors text-yellow-600"
                title="Suspend"
              >
                <Ban className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => handleActivate(user.id)}
                className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors text-green-600"
                title="Activate"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
            {user.role !== 'super_admin' && (
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowDeleteModal(true);
                }}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Delete User</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{selectedUser.full_name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4 text-yellow-600">
              <Ban className="h-6 w-6" />
              <h2 className="text-xl font-bold">Suspend User</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to suspend <strong>{selectedUser.full_name}</strong>? 
              The user will not be able to access the system until reactivated.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}