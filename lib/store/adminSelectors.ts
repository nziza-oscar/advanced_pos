// stores/adminSelectors.ts
import { useAdminStore } from './adminStore';

// Selectors for better performance
export const useTenants = () => useAdminStore((state) => state.tenants);
export const useUsers = () => useAdminStore((state) => state.users);
export const useTransactions = () => useAdminStore((state) => state.transactions);
export const useStats = () => useAdminStore((state) => state.stats);
export const useIsLoading = () => useAdminStore((state) => state.isLoading);
export const useError = () => useAdminStore((state) => state.error);
export const useSidebarOpen = () => useAdminStore((state) => state.sidebarOpen);
export const useSearchQuery = () => useAdminStore((state) => state.searchQuery);
export const useFilters = () => useAdminStore((state) => state.filters);
export const usePagination = () => useAdminStore((state) => state.pagination);

// Actions
export const useAdminActions = () => {
  return useAdminStore((state) => ({
    setSidebarOpen: state.setSidebarOpen,
    setSearchQuery: state.setSearchQuery,
    setFilters: state.setFilters,
    setPagination: state.setPagination,
    fetchTenants: state.fetchTenants,
    fetchUsers: state.fetchUsers,
    fetchTransactions: state.fetchTransactions,
    fetchStats: state.fetchStats,
    createTenant: state.createTenant,
    updateTenant: state.updateTenant,
    deleteTenant: state.deleteTenant,
    suspendTenant: state.suspendTenant,
    activateTenant: state.activateTenant,
    clearError: state.clearError,
    reset: state.reset,
  }));
};