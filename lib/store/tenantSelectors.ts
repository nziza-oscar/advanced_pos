// stores/tenantSelectors.ts
import { useTenantStore } from './tenantStore';

// Data Selectors
export const useProducts = () => useTenantStore((state) => state.products);
export const useCategories = () => useTenantStore((state) => state.categories);
export const useTransactions = () => useTenantStore((state) => state.transactions);
export const useCustomers = () => useTenantStore((state) => state.customers);
export const useSuppliers = () => useTenantStore((state) => state.suppliers);
export const useDashboard = () => useTenantStore((state) => state.dashboard);
export const useCart = () => useTenantStore((state) => state.cart);
export const useSelectedProduct = () => useTenantStore((state) => state.selectedProduct);
export const useSelectedTransaction = () => useTenantStore((state) => state.selectedTransaction);

// UI State Selectors
export const useIsLoading = () => useTenantStore((state) => state.isLoading);
export const useError = () => useTenantStore((state) => state.error);
export const useSidebarOpen = () => useTenantStore((state) => state.sidebarOpen);
export const useSearchQuery = () => useTenantStore((state) => state.searchQuery);
export const useFilters = () => useTenantStore((state) => state.filters);
export const usePagination = () => useTenantStore((state) => state.pagination);

// Cart Selectors
export const useCartItems = () => useTenantStore((state) => state.cart.items);
export const useCartTotal = () => {
  const items = useTenantStore((state) => state.cart.items);
  const discount = useTenantStore((state) => state.cart.discount_amount);
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  return { subtotal, discount, total: subtotal - discount };
};
export const useCartItemCount = () => {
  const items = useTenantStore((state) => state.cart.items);
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Actions Selector
export const useTenantActions = () => {
  return useTenantStore((state) => ({
    // UI
    setSidebarOpen: state.setSidebarOpen,
    setSearchQuery: state.setSearchQuery,
    setFilters: state.setFilters,
    setPagination: state.setPagination,
    clearError: state.clearError,
    reset: state.reset,
    
    // Cart
    addToCart: state.addToCart,
    removeFromCart: state.removeFromCart,
    updateCartQuantity: state.updateCartQuantity,
    clearCart: state.clearCart,
    setCartCustomer: state.setCartCustomer,
    setCartDiscount: state.setCartDiscount,
    
    // Products
    fetchProducts: state.fetchProducts,
    fetchProductById: state.fetchProductById,
    createProduct: state.createProduct,
    updateProduct: state.updateProduct,
    deleteProduct: state.deleteProduct,
    
    // Categories
    fetchCategories: state.fetchCategories,
    createCategory: state.createCategory,
    updateCategory: state.updateCategory,
    deleteCategory: state.deleteCategory,
    
    // Transactions
    fetchTransactions: state.fetchTransactions,
    fetchTransactionById: state.fetchTransactionById,
    createTransaction: state.createTransaction,
    voidTransaction: state.voidTransaction,
    
    // Customers
    fetchCustomers: state.fetchCustomers,
    createCustomer: state.createCustomer,
    
    // Suppliers
    fetchSuppliers: state.fetchSuppliers,
    createSupplier: state.createSupplier,
    
    // Dashboard
    fetchDashboard: state.fetchDashboard,
    
    // POS
    processPayment: state.processPayment,
  }));
};