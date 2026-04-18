// app/admin/tenants/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle,
  Building2,
  Users,
  Package,
  CreditCard,
  Calendar,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useTenants, useIsLoading, useAdminActions, usePagination, useSearchQuery, useFilters } from '@/lib/store/adminSelectors';

import { useModal } from '@/components/ui/ModalManager';
import { CreateTenantModal } from '@/components/ui/modals/CreateTenantModal';

export default function TenantsPage() {
  const tenants = useTenants();
  const isLoading = useIsLoading();
  const pagination = usePagination();
  const searchQuery = useSearchQuery();
  const { openModal } = useModal();

  const filters = useFilters();
  const { 
    fetchTenants, 
    deleteTenant, 
    suspendTenant, 
    activateTenant,
    setSearchQuery,
    setPagination,
    setFilters,
    clearError 
  } = useAdminActions();

  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    plan: '',
    status: ''
  });

  useEffect(() => {
    fetchTenants();
  }, [pagination.page, pagination.limit, searchQuery, localFilters]);

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
    setLocalFilters({ plan: '', status: '' });
    setFilters({});
    setPagination({ page: 1 });
    setShowFiltersPanel(false);
  };

  const handleDelete = async () => {
    if (selectedTenant) {
      await deleteTenant(selectedTenant.id);
      setShowDeleteModal(false);
      setSelectedTenant(null);
      fetchTenants();
    }
  };

  const handleSuspend = async () => {
    if (selectedTenant) {
      await suspendTenant(selectedTenant.id);
      setShowSuspendModal(false);
      setSelectedTenant(null);
      fetchTenants();
    }
  };

    const handleCreateTenant = () => {
    openModal({
      title: 'Create New Tenant',
      content: <CreateTenantModal />,
      size: 'md'
    });
  };

  const handleActivate = async (tenantId: string) => {
    await activateTenant(tenantId);
    fetchTenants();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      trial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    };
    return styles[status] || styles.active;
  };

  const getPlanBadge = (plan: string) => {
    const styles: Record<string, string> = {
      basic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      professional: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      enterprise: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      trial: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    };
    return styles[plan] || styles.trial;
  };

  if (isLoading && !tenants.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tenants...</p>
        </div>
      </div>
    );
  }

  const hasActiveFilters = localFilters.plan || localFilters.status;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground mt-1">Manage all tenant accounts</p>
        </div>
        <button
          onClick={() => handleCreateTenant()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Tenant
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tenants by name or slug..."
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
              {(localFilters.plan ? 1 : 0) + (localFilters.status ? 1 : 0)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <select
              value={localFilters.plan}
              onChange={(e) => setLocalFilters({ ...localFilters, plan: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="">All Plans</option>
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
              <option value="trial">Trial</option>
            </select>
            <select
              value={localFilters.status}
              onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="trial">Trial</option>
              <option value="expired">Expired</option>
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

      {/* Tenants Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tenant</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Plan</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Users</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Products</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Subscription</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No tenants found</p>
                  </td>
                </tr>
              ) : (
                tenants.map((tenant: any) => (
                  <tr key={tenant.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {tenant.logo_url ? (
                            <img src={tenant.logo_url} alt={tenant.name} className="w-8 h-8 rounded" />
                          ) : (
                            <Building2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{tenant.name}</p>
                          <p className="text-sm text-muted-foreground">{tenant.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPlanBadge(tenant.plan)}`}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{tenant.stats?.users || 0}</span>
                        <span className="text-muted-foreground text-xs">
                          / {tenant.max_users || 5}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <span>{tenant.stats?.products || 0}</span>
                        <span className="text-muted-foreground text-xs">
                          / {tenant.max_products || 1000}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {tenant.subscription_end 
                            ? new Date(tenant.subscription_end).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.location.href = `/admin/tenants/${tenant.id}`}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {tenant.status === 'suspended' ? (
                          <button
                            onClick={() => handleActivate(tenant.id)}
                            className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors text-green-600"
                            title="Activate"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          tenant.status !== 'expired' && (
                            <button
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setShowSuspendModal(true);
                              }}
                              className="p-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors text-yellow-600"
                              title="Suspend"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )
                        )}
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tenants
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
      {showDeleteModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Delete Tenant</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{selectedTenant.name}</strong>? 
              This action cannot be undone and will delete all associated data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTenant(null);
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
      {showSuspendModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4 text-yellow-600">
              <Ban className="h-6 w-6" />
              <h2 className="text-xl font-bold">Suspend Tenant</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to suspend <strong>{selectedTenant.name}</strong>? 
              The tenant will not be able to access the system until reactivated.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSelectedTenant(null);
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