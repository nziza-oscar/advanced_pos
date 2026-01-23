import { create } from 'zustand';
import { Product } from '@/lib/database/models';

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
  
  // Helper computed values
  filteredProducts: Product[];
  totalPages: number;
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