// stores/adminSelectors.ts
import { useAdminStore } from './adminStore';

// Data Selectors
export const useTenants = () => useAdminStore((state) => state.tenants);
export const useUsers = () => useAdminStore((state) => state.users);
export const useTransactions = () => useAdminStore((state) => state.transactions);
export const useStats = () => useAdminStore((state) => state.stats);
export const useSelectedTenant = () => useAdminStore((state) => state.selectedTenant);
export const useSelectedUser = () => useAdminStore((state) => state.selectedUser);

// UI State Selectors
export const useIsLoading = () => useAdminStore((state) => state.isLoading);
export const useError = () => useAdminStore((state) => state.error);
export const useSidebarOpen = () => useAdminStore((state) => state.sidebarOpen);
export const useSearchQuery = () => useAdminStore((state) => state.searchQuery);
export const useFilters = () => useAdminStore((state) => state.filters);
export const usePagination = () => useAdminStore((state) => state.pagination);

// Actions
export const useAdminActions = () => {
  return useAdminStore((state) => ({
    // UI Actions
    setSidebarOpen: state.setSidebarOpen,
    setSearchQuery: state.setSearchQuery,
    setFilters: state.setFilters,
    setPagination: state.setPagination,
    
    // Tenant Actions
    fetchTenants: state.fetchTenants,
    fetchTenantById: state.fetchTenantById,
    createTenant: state.createTenant,
    updateTenant: state.updateTenant,
    deleteTenant: state.deleteTenant,
    suspendTenant: state.suspendTenant,
    activateTenant: state.activateTenant,
    
    // User Actions
    fetchUsers: state.fetchUsers,
    fetchUserById: state.fetchUserById,
    createUser: state.createUser,
    updateUser: state.updateUser,
    deleteUser: state.deleteUser,
    suspendUser: state.suspendUser,
    activateUser: state.activateUser,
    
    // Transaction Actions
    fetchTransactions: state.fetchTransactions,
    fetchTransactionById: state.fetchTransactionById,
    
    // Stats Actions
    fetchStats: state.fetchStats,
    
    // Utility
    clearError: state.clearError,
    reset: state.reset,
  }));
};