// stores/tenantStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_level: number;
  category_id: string;
  category?: { id: string; name: string };
  is_active: boolean;
  image_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  product_count?: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  transaction_number: string;
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'momo' | 'card';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  created_at: string;
  cashier?: { id: string; full_name: string };
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  total_spent: number;
  total_transactions: number;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface DashboardData {
  todaySales: number;
  todayTransactions: number;
  weekSales: number;
  monthSales: number;
  totalProducts: number;
  lowStockCount: number;
  recentTransactions: Transaction[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

// Store State
interface TenantState {
  // Data
  products: Product[];
  categories: Category[];
  transactions: Transaction[];
  customers: Customer[];
  suppliers: Supplier[];
  dashboard: DashboardData | null;
  selectedProduct: Product | null;
  selectedTransaction: Transaction | null;
  
  // Cart (for POS)
  cart: {
  items: {
    id?: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: Product;
  }[];
  customer_id?: string;
  discount_amount: number;
  note?: string;
};
  
  // UI State
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  searchQuery: string;
  filters: {
    category?: string;
    status?: string;
    dateRange?: { start: Date; end: Date };
    minPrice?: number;
    maxPrice?: number;
  };
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Actions - UI
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<TenantState['filters']>) => void;
  setPagination: (pagination: Partial<TenantState['pagination']>) => void;
  clearError: () => void;
  reset: () => void;
  
  // Actions - Cart
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartCustomer: (customerId: string) => void;
  setCartDiscount: (amount: number) => void;
  
  // Actions - Products
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  createProduct: (data: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Actions - Categories
  fetchCategories: () => Promise<void>;
  createCategory: (data: { name: string; description?: string }) => Promise<void>;
  updateCategory: (id: string, data: { name: string; description?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Actions - Transactions
  fetchTransactions: () => Promise<void>;
  fetchTransactionById: (id: string) => Promise<Transaction | null>;
  createTransaction: (data: any) => Promise<Transaction>;
  voidTransaction: (id: string, reason?: string) => Promise<void>;
  
  // Actions - Customers
  fetchCustomers: () => Promise<void>;
  createCustomer: (data: { name: string; email?: string; phone?: string }) => Promise<void>;
  
  // Actions - Suppliers
  fetchSuppliers: () => Promise<void>;
  createSupplier: (data: { name: string; email?: string; phone?: string; address?: string }) => Promise<void>;
  
  // Actions - Dashboard
  fetchDashboard: () => Promise<void>;
  
  // Actions - POS
  processPayment: (paymentMethod: string, amountPaid: number) => Promise<Transaction>;
}

// Initial state
const initialState = {
  products: [],
  categories: [],
  transactions: [],
  customers: [],
  suppliers: [],
  dashboard: null,
  selectedProduct: null,
  selectedTransaction: null,
  cart: {
    items: [],
    discount_amount: 0,
  },
  isLoading: false,
  error: null,
  sidebarOpen: false,
  searchQuery: '',
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

// Helper to get tenant slug from URL
const getTenantSlug = () => {
  if (typeof window === 'undefined') return '';
  return window.location.pathname.split('/')[1];
};

// Create store with immer
export const useTenantStore = create<TenantState>()(
  immer((set, get) => ({
    ...initialState,
    
    // UI Actions
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    
    setSearchQuery: (query) => set({ searchQuery: query, pagination: { ...get().pagination, page: 1 } }),
    
    setFilters: (filters) => set({ filters: { ...get().filters, ...filters }, pagination: { ...get().pagination, page: 1 } }),
    
    setPagination: (pagination) => set({ pagination: { ...get().pagination, ...pagination } }),
    
    clearError: () => set({ error: null }),
    
    reset: () => set(initialState),
    
    // Cart Actions
    addToCart: (product, quantity) => {
      set((state) => {
        const existingItem = state.cart.items.find(item => item.product_id === product.id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
          existingItem.total_price = existingItem.quantity * existingItem.unit_price;
        } else {
          state.cart.items.push({
            product_id: product.id,
            product_name: product.name,
            quantity: quantity,
            unit_price: product.price,
            total_price: product.price * quantity,
            product: product
          });
        }
      });
    },
    
    removeFromCart: (productId) => {
      set((state) => {
        state.cart.items = state.cart.items.filter(item => item.product_id !== productId);
      });
    },
    
    updateCartQuantity: (productId, quantity) => {
      set((state) => {
        const item = state.cart.items.find(item => item.product_id === productId);
        if (item) {
          if (quantity <= 0) {
            state.cart.items = state.cart.items.filter(i => i.product_id !== productId);
          } else {
            item.quantity = quantity;
            item.total_price = quantity * item.unit_price;
          }
        }
      });
    },
    
    clearCart: () => {
      set((state) => {
        state.cart = { items: [], discount_amount: 0 };
      });
    },
    
    setCartCustomer: (customerId) => {
      set((state) => {
        state.cart.customer_id = customerId;
      });
    },
    
    setCartDiscount: (amount) => {
      set((state) => {
        state.cart.discount_amount = amount;
      });
    },
    
    // Products Actions
    fetchProducts: async () => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const { page, limit } = get().pagination;
        const { searchQuery, filters } = get();
        
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(searchQuery && { search: searchQuery }),
          ...(filters.category && { category: filters.category }),
          ...(filters.minPrice && { minPrice: filters.minPrice.toString() }),
          ...(filters.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        });
        
        const response = await fetch(`/api/${tenantSlug}/products?${params}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        set({
          products: data.data?.products || [],
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
    
    fetchProductById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        
        const data = await response.json();
        set({ selectedProduct: data.data, isLoading: false });
        return data.data;
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        return null;
      }
    },
    
    createProduct: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error('Failed to create product');
        
        const result = await response.json();
        set((state) => ({
          products: [result.data, ...state.products],
          isLoading: false,
        }));
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },
    
    updateProduct: async (id, data) => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error('Failed to update product');
        
        const result = await response.json();
        set((state) => ({
          products: state.products.map(p => p.id === id ? result.data : p),
          selectedProduct: state.selectedProduct?.id === id ? result.data : state.selectedProduct,
          isLoading: false,
        }));
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },
    
    deleteProduct: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/products/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to delete product');
        
        set((state) => ({
          products: state.products.filter(p => p.id !== id),
          isLoading: false,
        }));
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },
    
    // Categories Actions
    fetchCategories: async () => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const data = await response.json();
        set({
          categories: data.data || [],
          isLoading: false,
        });
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
      }
    },
    
    createCategory: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error('Failed to create category');
        
        const result = await response.json();
        set((state) => ({
          categories: [result.data, ...state.categories],
          isLoading: false,
        }));
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },
    
    updateCategory: async (id, data) => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/categories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error('Failed to update category');
        
        const result = await response.json();
        set((state) => ({
          categories: state.categories.map(c => c.id === id ? result.data : c),
          isLoading: false,
        }));
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },
    
    deleteCategory: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/categories/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to delete category');
        
        set((state) => ({
          categories: state.categories.filter(c => c.id !== id),
          isLoading: false,
        }));
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },
    
    // Transactions Actions
    fetchTransactions: async () => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const { page, limit } = get().pagination;
        const { filters } = get();
        
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(filters.status && { status: filters.status }),
          ...(filters.dateRange?.start && { startDate: filters.dateRange.start.toISOString() }),
          ...(filters.dateRange?.end && { endDate: filters.dateRange.end.toISOString() }),
        });
        
        const response = await fetch(`/api/${tenantSlug}/transactions?${params}`);
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
    
    fetchTransactionById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/transactions/${id}`);
        if (!response.ok) throw new Error('Failed to fetch transaction');
        
        const data = await response.json();
        set({ selectedTransaction: data.data, isLoading: false });
        return data.data;
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        return null;
      }
    },
    
    createTransaction: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error('Failed to create transaction');
        
        const result = await response.json();
        set((state) => ({
          transactions: [result.data, ...state.transactions],
          cart: { items: [], discount_amount: 0 },
          isLoading: false,
        }));
        return result.data;
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },
    
    voidTransaction: async (id, reason) => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/transactions/${id}/void`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        
        if (!response.ok) throw new Error('Failed to void transaction');
        
        set((state) => ({
          transactions: state.transactions.map(t => 
            t.id === id ? { ...t, status: 'cancelled' } : t
          ),
          isLoading: false,
        }));
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },
    
    // Customers Actions
    fetchCustomers: async () => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const { page, limit } = get().pagination;
        const { searchQuery } = get();
        
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(searchQuery && { search: searchQuery }),
        });
        
        const response = await fetch(`/api/${tenantSlug}/customers?${params}`);
        if (!response.ok) throw new Error('Failed to fetch customers');
        
        const data = await response.json();
        set({
          customers: data.data?.customers || [],
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
    
    createCustomer: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error('Failed to create customer');
        
        const result = await response.json();
        set((state) => ({
          customers: [result.data, ...state.customers],
          isLoading: false,
        }));
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },
    
    // Suppliers Actions
    fetchSuppliers: async () => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/suppliers`);
        if (!response.ok) throw new Error('Failed to fetch suppliers');
        
        const data = await response.json();
        set({
          suppliers: data.data || [],
          isLoading: false,
        });
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
      }
    },
    
    createSupplier: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/suppliers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error('Failed to create supplier');
        
        const result = await response.json();
        set((state) => ({
          suppliers: [result.data, ...state.suppliers],
          isLoading: false,
        }));
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },
    
    // Dashboard Actions
    fetchDashboard: async () => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`/api/${tenantSlug}/dashboard/stats`);
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        
        const data = await response.json();
        set({ dashboard: data.data, isLoading: false });
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
      }
    },
    
    // POS Actions
    processPayment: async (paymentMethod, amountPaid) => {
      set({ isLoading: true, error: null });
      try {
        const tenantSlug = getTenantSlug();
        const { cart } = get();
        
        const subtotal = cart.items.reduce((sum, item) => sum + item.total_price, 0);
        const totalAmount = subtotal - cart.discount_amount;
        const changeAmount = amountPaid - totalAmount;
        
        const transactionData = {
          items: cart.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          })),
          subtotal,
          discount_amount: cart.discount_amount,
          total_amount: totalAmount,
          amount_paid: amountPaid,
          change_amount: changeAmount,
          payment_method: paymentMethod,
          customer_id: cart.customer_id,
          notes: cart.note,
        };
        
        const response = await fetch(`/api/${tenantSlug}/pos/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData),
        });
        
        if (!response.ok) throw new Error('Failed to process payment');
        
        const result = await response.json();
        
        // Clear cart after successful payment
        set((state) => ({
          cart: { items: [], discount_amount: 0 },
          isLoading: false,
        }));
        
        return result.data;
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },
  }))
);