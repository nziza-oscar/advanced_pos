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
  max_users?: number;
  max_products?: number;
  stats?: {
    users: number;
    products: number;
  };
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
  created_at: string;
  tenant?: { name: string; slug: string };
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
  selectedUser: User | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  searchQuery: string;
  filters: {
    status?: string;
    plan?: string;
    role?: string;
    tenant_id?: string;
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
  
  // API Actions - Tenants
  fetchTenants: () => Promise<void>;
  fetchTenantById: (id: string) => Promise<any>;
  createTenant: (data: Partial<Tenant>) => Promise<void>;
  updateTenant: (id: string, data: Partial<Tenant>) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  suspendTenant: (id: string) => Promise<void>;
  activateTenant: (id: string) => Promise<void>;
  
  // API Actions - Users
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<any>;
  createUser: (data: Partial<User>) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  suspendUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  
  // API Actions - Transactions
  fetchTransactions: () => Promise<void>;
  fetchTransactionById: (id: string) => Promise<any>;
  
  // API Actions - Stats
  fetchStats: () => Promise<void>;
  
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
  selectedUser: null,
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
        
        // Tenant API Actions
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
            
            const response = await fetch(`/api/tenants?${params}`);
            if (!response.ok) throw new Error('Failed to fetch tenants');
            
            const data = await response.json();
            set({
              tenants: data.data?.tenants || [],
              pagination: {
                ...get().pagination,
                total: data.pagination?.total || 0,
                totalPages: data.pagination?.totalPages || 0,
              },
              isLoading: false,
            });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
          }
        },
        
        fetchTenantById: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`/api/tenants/${id}`);
            if (!response.ok) throw new Error('Failed to fetch tenant');
            
            const data = await response.json();
            set({ selectedTenant: data.data, isLoading: false });
            return data.data;
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        createTenant: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('/api/tenants', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            
            if (!response.ok) throw new Error('Failed to create tenant');
            
            const result = await response.json();
            set((state) => ({
              tenants: [result.data.tenant, ...state.tenants],
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
            const response = await fetch(`/api/tenants/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            
            if (!response.ok) throw new Error('Failed to update tenant');
            
            const result = await response.json();
            set((state) => ({
              tenants: state.tenants.map(t => t.id === id ? result.data : t),
              selectedTenant: state.selectedTenant?.id === id ? result.data : state.selectedTenant,
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
            const response = await fetch(`/api/tenants/${id}`, {
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
            const response = await fetch(`/api/tenants/${id}/suspend`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch(`/api/tenants/${id}/activate`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
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
        
        // User API Actions
        fetchUsers: async () => {
          set({ isLoading: true, error: null });
          try {
            const { page, limit } = get().pagination;
            const { searchQuery, filters } = get();
            
            const params = new URLSearchParams({
              page: page.toString(),
              limit: limit.toString(),
              ...(searchQuery && { search: searchQuery }),
              ...(filters.role && { role: filters.role }),
              ...(filters.status && { status: filters.status }),
              ...(filters.tenant_id && { tenantId: filters.tenant_id }),
            });
            
            const response = await fetch(`/api/admin/users?${params}`);
            if (!response.ok) throw new Error('Failed to fetch users');
            
            const data = await response.json();
            set({
              users: data.data?.users || [],
              pagination: {
                ...get().pagination,
                total: data.pagination?.total || 0,
                totalPages: data.pagination?.totalPages || 0,
              },
              isLoading: false,
            });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
          }
        },
        
        fetchUserById: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`/api/admin/users/${id}`);
            if (!response.ok) throw new Error('Failed to fetch user');
            
            const data = await response.json();
            set({ selectedUser: data.data, isLoading: false });
            return data.data;
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        createUser: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('/api/admin/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            
            if (!response.ok) throw new Error('Failed to create user');
            
            const result = await response.json();
            set((state) => ({
              users: [result.data, ...state.users],
              isLoading: false,
            }));
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        updateUser: async (id, data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`/api/admin/users/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            
            if (!response.ok) throw new Error('Failed to update user');
            
            const result = await response.json();
            set((state) => ({
              users: state.users.map(u => u.id === id ? result.data : u),
              selectedUser: state.selectedUser?.id === id ? result.data : state.selectedUser,
              isLoading: false,
            }));
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        deleteUser: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`/api/admin/users/${id}`, {
              method: 'DELETE',
            });
            
            if (!response.ok) throw new Error('Failed to delete user');
            
            set((state) => ({
              users: state.users.filter(u => u.id !== id),
              selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
              isLoading: false,
            }));
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        suspendUser: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`/api/admin/users/${id}/suspend`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
            });
            
            if (!response.ok) throw new Error('Failed to suspend user');
            
            set((state) => ({
              users: state.users.map(u => 
                u.id === id ? { ...u, is_active: false } : u
              ),
              selectedUser: state.selectedUser?.id === id 
                ? { ...state.selectedUser, is_active: false } 
                : state.selectedUser,
              isLoading: false,
            }));
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        activateUser: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`/api/admin/users/${id}/activate`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
            });
            
            if (!response.ok) throw new Error('Failed to activate user');
            
            set((state) => ({
              users: state.users.map(u => 
                u.id === id ? { ...u, is_active: true } : u
              ),
              selectedUser: state.selectedUser?.id === id 
                ? { ...state.selectedUser, is_active: true } 
                : state.selectedUser,
              isLoading: false,
            }));
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        // Transaction API Actions
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
              transactions: data.data?.transactions || [],
              pagination: {
                ...get().pagination,
                total: data.pagination?.total || 0,
                totalPages: data.pagination?.totalPages || 0,
              },
              isLoading: false,
            });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
          }
        },
        
        fetchTransactionById: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`/api/admin/transactions/${id}`);
            if (!response.ok) throw new Error('Failed to fetch transaction');
            
            const data = await response.json();
            set({ isLoading: false });
            return data.data;
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        // Stats API Actions
        fetchStats: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('/api/admin/statistics');
            if (!response.ok) throw new Error('Failed to fetch stats');
            
            const data = await response.json();
            set({ stats: data.data, isLoading: false });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
          }
        },
        
        clearError: () => set({ error: null }),
        
        reset: () => set(initialState),
      }),
      {
        name: 'admin-storage',
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