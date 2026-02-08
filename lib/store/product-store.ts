import { create } from 'zustand';
import { Product } from '@/lib/database/models';
import { toast } from 'sonner';

interface ProductState {
  // Products data
  products: Product[];
  featuredProducts: Product[];
  lowStockProducts: Product[];
  
  // Filtering
  searchTerm: string;
  selectedCategory: string | null;
  sortBy: 'name' | 'price' | 'stock' | 'created';
  sortOrder: 'asc' | 'desc';
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  totalProducts: number;
  
  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Actions
  setProducts: (products: Product[]) => void;
  setFeaturedProducts: (products: Product[]) => void;
  setLowStockProducts: (products: Product[]) => void;
  
  // Filter actions
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSortBy: (sortBy: 'name' | 'price' | 'stock' | 'created') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  toggleSortOrder: () => void;
  
  // Pagination actions
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  setTotalProducts: (total: number) => void;
  
  // Loading actions
  setIsLoading: (loading: boolean) => void;
  setIsSearching: (searching: boolean) => void;
  setIsCreating: (creating: boolean) => void;
  setIsUpdating: (updating: boolean) => void;
  setIsDeleting: (deleting: boolean) => void;
  
  // CRUD Operations
  fetchProducts: (params?: FetchProductsParams) => Promise<void>;
  createProduct: (productData: CreateProductData, imageFile?: File) => Promise<Product | null>;
  updateProduct: (id: string, productData: Partial<Product>, imageFile?: File) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  
  // Helper computed values
  filteredProducts: Product[];
  totalPages: number;
}

interface FetchProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'name' | 'price' | 'stock' | 'created';
  sortOrder?: 'asc' | 'desc';
}

interface CreateProductData {
  name: string;
  category_id: string; // Make optional since it can be null
  cost_price: number;
  selling_price: number; // Your API might expect 'price' not 'selling_price'
  stock_quantity: number;
  description?: string;
  min_stock_level?: number;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  products: [],
  featuredProducts: [],
  lowStockProducts: [],
  
  searchTerm: '',
  selectedCategory: null,
  sortBy: 'created',
  sortOrder: 'desc',
  
  currentPage: 1,
  itemsPerPage: 20,
  totalProducts: 0,
  
  isLoading: false,
  isSearching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  
  // Actions
  setProducts: (products) => set({ products }),
  setFeaturedProducts: (products) => set({ featuredProducts: products }),
  setLowStockProducts: (products) => set({ lowStockProducts: products }),
  
  setSearchTerm: (term) => set({ searchTerm: term, currentPage: 1 }),
  setSelectedCategory: (category) => set({ selectedCategory: category, currentPage: 1 }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder: order }),
  toggleSortOrder: () => set((state) => ({ 
    sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' 
  })),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  setItemsPerPage: (count) => set({ itemsPerPage: count, currentPage: 1 }),
  setTotalProducts: (total) => set({ totalProducts: total }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsSearching: (searching) => set({ isSearching: searching }),
  setIsCreating: (creating) => set({ isCreating: creating }),
  setIsUpdating: (updating) => set({ isUpdating: updating }),
  setIsDeleting: (deleting) => set({ isDeleting: deleting }),
  
  // CRUD Operations
  fetchProducts: async (params = {}) => {
    try {
      set({ isLoading: true });
      
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        console.log(data)
        set({ 
          products: data.data.products,
          totalProducts: data.data.total,
          currentPage: data.data.page || 1
        });
      } else {
        toast.error(data.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      set({ isLoading: false });
    }
  },
  
 
createProduct: async (productData: CreateProductData, imageFile?: File): Promise<Product | null> => {
  try {
    set({ isCreating: true });
    
    // Check if barcodes are available
    const barcodeCheck = await fetch('/api/barcode/available');
    const barcodeData = await barcodeCheck.json();
    
    if (!barcodeData.success || barcodeData.data.available_count === 0) {
      toast.error('No barcodes available. Please contact admin.');
      return null;
    }
    
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('category_id', productData.category_id);
    formData.append('cost_price', productData.cost_price.toString());
    formData.append('selling_price', productData.selling_price.toString());
    formData.append('stock_quantity', productData.stock_quantity.toString());
    
    if (productData.description) {
      formData.append('description', productData.description);
    }
    
    if (productData.min_stock_level) {
      formData.append('min_stock_level', productData.min_stock_level.toString());
    }
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const response = await fetch('/api/products', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast.success('Product created successfully!');
      
      set((state) => {
        const currentProducts = Array.isArray(state.products) ? state.products : [];
        
        return {
          products: [data.data, ...currentProducts],
          totalProducts: state.totalProducts + 1
        };
      });
      
      return data.data;
    } else {
      if (data.errorType === 'NO_BARCODES_AVAILABLE') {
        toast.error('No barcodes available. Please generate more barcodes.');
      } else {
        toast.error(data.error || 'Failed to create product');
      }
      return null;
    }
  } catch (error) {
    console.error('Error creating product:', error);
    toast.error('Failed to create product');
    return null;
  } finally {
    set({ isCreating: false });
  }
},
  
updateProduct: async (id: string, productData: Partial<Product>, imageFile?: File): Promise<Product | null> => {
  try {
    set({ isUpdating: true });
    
    const formData = new FormData();
    
    // Append only the fields that are provided (matching your Product model)
    if (productData.name !== undefined) formData.append('name', productData.name);
    if (productData.category_id !== undefined) {
      formData.append('category_id', productData.category_id || '');
    }
    if (productData.cost_price !== undefined) {
      formData.append('cost_price', productData.cost_price?.toString() || '0');
    }
    if (productData.price !== undefined) {
      formData.append('price', productData.price.toString());
    }
    if (productData.stock_quantity !== undefined) {
      formData.append('stock_quantity', productData.stock_quantity.toString());
    }
    if (productData.description !== undefined) {
      formData.append('description', productData.description || '');
    }
    if (productData.min_stock_level !== undefined) {
      formData.append('min_stock_level', productData.min_stock_level.toString());
    }
    if (productData.is_active !== undefined) {
      formData.append('is_active', productData.is_active.toString());
    }
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast.success('Product updated successfully!');
      // Update the product in the store with the full response data
      set((state) => ({
        products: state.products.map(product => 
          product.id === id ? { ...product, ...data.data } : product
        )
      }));
      return data.data;
    } else {
      toast.error(data.error || 'Failed to update product');
      return null;
    }
  } catch (error) {
    console.error('Error updating product:', error);
    toast.error('Failed to update product');
    return null;
  } finally {
    set({ isUpdating: false });
  }
},
  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      set({ isDeleting: true });
      
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Product deleted successfully!');
        // Remove the product from the store
        set((state) => ({
          products: state.products.filter(product => product.id !== id),
          totalProducts: state.totalProducts - 1
        }));
        return true;
      } else {
        toast.error(data.error || 'Failed to delete product');
        return false;
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      return false;
    } finally {
      set({ isDeleting: false });
    }
  },
  
  // Computed values
  get filteredProducts() {
    const { products, searchTerm, selectedCategory, sortBy, sortOrder } = get();
    
    let filtered = [...products];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.barcode.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category_id === selectedCategory
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stock_quantity;
          bValue = b.stock_quantity;
          break;
        case 'created':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  },
  
  get totalPages() {
    const { itemsPerPage, totalProducts } = get();
    return Math.ceil(totalProducts / itemsPerPage);
  }
}));

// Helper hooks
export const useProductFilters = () => {
  const searchTerm = useProductStore((state) => state.searchTerm);
  const selectedCategory = useProductStore((state) => state.selectedCategory);
  const sortBy = useProductStore((state) => state.sortBy);
  const sortOrder = useProductStore((state) => state.sortOrder);
  const setSearchTerm = useProductStore((state) => state.setSearchTerm);
  const setSelectedCategory = useProductStore((state) => state.setSelectedCategory);
  const setSortBy = useProductStore((state) => state.setSortBy);
  const setSortOrder = useProductStore((state) => state.setSortOrder);
  const toggleSortOrder = useProductStore((state) => state.toggleSortOrder);
  
  return {
    searchTerm,
    selectedCategory,
    sortBy,
    sortOrder,
    setSearchTerm,
    setSelectedCategory,
    setSortBy,
    setSortOrder,
    toggleSortOrder
  };
};

// Hook for product CRUD operations
export const useProductOperations = () => {
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const createProduct = useProductStore((state) => state.createProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const deleteProduct = useProductStore((state) => state.deleteProduct);
  const isLoading = useProductStore((state) => state.isLoading);
  const isCreating = useProductStore((state) => state.isCreating);
  const isUpdating = useProductStore((state) => state.isUpdating);
  const isDeleting = useProductStore((state) => state.isDeleting);
  
  return {
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting
  };
};