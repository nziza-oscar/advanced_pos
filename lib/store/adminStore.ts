// stores/adminStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'trial' | 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'trial' | 'suspended' | 'expired';
  logo_url?: string;
  created_at: string;
  subscription_end?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  tenant_id?: string;
  is_active: boolean;
  last_login?: string;
}

export interface Transaction {
  id: string;
  transaction_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  tenant?: { name: string; slug: string };
  cashier?: { full_name: string };
}

export interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
  recentTransactions: Transaction[];
  recentTenants: Tenant[];
}

// Store State
interface AdminState {
  // Data
  tenants: Tenant[];
  users: User[];
  transactions: Transaction[];
  stats: DashboardStats | null;
  selectedTenant: Tenant | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  searchQuery: string;
  filters: {
    status?: string;
    plan?: string;
    dateRange?: { start: Date; end: Date };
  };
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<AdminState['filters']>) => void;
  setPagination: (pagination: Partial<AdminState['pagination']>) => void;
  
  // API Actions
  fetchTenants: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createTenant: (data: Partial<Tenant>) => Promise<void>;
  updateTenant: (id: string, data: Partial<Tenant>) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  suspendTenant: (id: string) => Promise<void>;
  activateTenant: (id: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

// Initial state
const initialState = {
  tenants: [],
  users: [],
  transactions: [],
  stats: null,
  selectedTenant: null,
  isLoading: false,
  error: null,
  sidebarOpen: false,
  searchQuery: '',
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Create store with persist and immer
export const useAdminStore = create<AdminState>()(
  immer(
    persist(
      (set, get) => ({
        ...initialState,
        
        // UI Actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        
        setSearchQuery: (query) => set({ searchQuery: query, pagination: { ...get().pagination, page: 1 } }),
        
        setFilters: (filters) => set({ filters: { ...get().filters, ...filters }, pagination: { ...get().pagination, page: 1 } }),
        
        setPagination: (pagination) => set({ pagination: { ...get().pagination, ...pagination } }),
        
        // API Actions
        fetchTenants: async () => {
          set({ isLoading: true, error: null });
          try {
            const { page, limit } = get().pagination;
            const { searchQuery, filters } = get();
            
            const params = new URLSearchParams({
              page: page.toString(),
              limit: limit.toString(),
              ...(searchQuery && { search: searchQuery }),
              ...(filters.status && { status: filters.status }),
              ...(filters.plan && { plan: filters.plan }),
            });
            
            const response = await fetch(`/api/admin/tenants?${params}`);
            if (!response.ok) throw new Error('Failed to fetch tenants');
            
            const data = await response.json();
            set({
              tenants: data.tenants,
              pagination: {
                ...get().pagination,
                total: data.pagination.total,
                totalPages: data.pagination.totalPages,
              },
              isLoading: false,
            });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
          }
        },
        
        fetchUsers: async () => {
          set({ isLoading: true, error: null });
          try {
            const { page, limit } = get().pagination;
            const { searchQuery } = get();
            
            const params = new URLSearchParams({
              page: page.toString(),
              limit: limit.toString(),
              ...(searchQuery && { search: searchQuery }),
            });
            
            const response = await fetch(`/api/admin/users?${params}`);
            if (!response.ok) throw new Error('Failed to fetch users');
            
            const data = await response.json();
            set({
              users: data.users,
              pagination: {
                ...get().pagination,
                total: data.pagination.total,
                totalPages: data.pagination.totalPages,
              },
              isLoading: false,
            });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
          }
        },
        
        fetchTransactions: async () => {
          set({ isLoading: true, error: null });
          try {
            const { page, limit } = get().pagination;
            const { filters } = get();
            
            const params = new URLSearchParams({
              page: page.toString(),
              limit: limit.toString(),
              ...(filters.dateRange?.start && { startDate: filters.dateRange.start.toISOString() }),
              ...(filters.dateRange?.end && { endDate: filters.dateRange.end.toISOString() }),
            });
            
            const response = await fetch(`/api/admin/transactions?${params}`);
            if (!response.ok) throw new Error('Failed to fetch transactions');
            
            const data = await response.json();
            set({
              transactions: data.transactions,
              pagination: {
                ...get().pagination,
                total: data.pagination.total,
                totalPages: data.pagination.totalPages,
              },
              isLoading: false,
            });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
          }
        },
        
        fetchStats: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('/api/admin/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            
            const data = await response.json();
            set({ stats: data.stats, isLoading: false });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
          }
        },
        
        createTenant: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('/api/admin/tenants', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            
            if (!response.ok) throw new Error('Failed to create tenant');
            
            const newTenant = await response.json();
            set((state) => ({
              tenants: [newTenant, ...state.tenants],
              isLoading: false,
            }));
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        updateTenant: async (id, data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`/api/admin/tenants/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            
            if (!response.ok) throw new Error('Failed to update tenant');
            
            const updatedTenant = await response.json();
            set((state) => ({
              tenants: state.tenants.map(t => t.id === id ? updatedTenant : t),
              selectedTenant: state.selectedTenant?.id === id ? updatedTenant : state.selectedTenant,
              isLoading: false,
            }));
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        deleteTenant: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`/api/admin/tenants/${id}`, {
              method: 'DELETE',
            });
            
            if (!response.ok) throw new Error('Failed to delete tenant');
            
            set((state) => ({
              tenants: state.tenants.filter(t => t.id !== id),
              selectedTenant: state.selectedTenant?.id === id ? null : state.selectedTenant,
              isLoading: false,
            }));
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        suspendTenant: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`/api/admin/tenants/${id}/suspend`, {
              method: 'POST',
            });
            
            if (!response.ok) throw new Error('Failed to suspend tenant');
            
            set((state) => ({
              tenants: state.tenants.map(t => 
                t.id === id ? { ...t, status: 'suspended' as const } : t
              ),
              selectedTenant: state.selectedTenant?.id === id 
                ? { ...state.selectedTenant, status: 'suspended' as const } 
                : state.selectedTenant,
              isLoading: false,
            }));
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        activateTenant: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`/api/admin/tenants/${id}/activate`, {
              method: 'POST',
            });
            
            if (!response.ok) throw new Error('Failed to activate tenant');
            
            set((state) => ({
              tenants: state.tenants.map(t => 
                t.id === id ? { ...t, status: 'active' as const } : t
              ),
              selectedTenant: state.selectedTenant?.id === id 
                ? { ...state.selectedTenant, status: 'active' as const } 
                : state.selectedTenant,
              isLoading: false,
            }));
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        clearError: () => set({ error: null }),
        
        reset: () => set(initialState),
      }),
      {
        name: 'admin-storage', // unique name for localStorage
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          searchQuery: state.searchQuery,
          filters: state.filters,
          pagination: state.pagination,
        }),
      }
    )
  )
);