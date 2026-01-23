import { create } from 'zustand';

export interface Transaction {
  id: string;
  transaction_number: string;
  customer_name?: string;
  customer_phone?: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  items_count: number;
}

interface TransactionState {
  // Transactions
  transactions: Transaction[];
  recentTransactions: Transaction[];
  todayTransactions: Transaction[];
  
  // Stats
  todayRevenue: number;
  todayTransactionsCount: number;
  averageTransactionValue: number;
  
  // Filters
  dateRange: { start: Date | null; end: Date | null };
  paymentMethodFilter: string | null;
  statusFilter: string | null;
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  totalTransactions: number;
  
  // Loading
  isLoading: boolean;
  
  // Actions
  setTransactions: (transactions: Transaction[]) => void;
  setRecentTransactions: (transactions: Transaction[]) => void;
  setTodayTransactions: (transactions: Transaction[]) => void;
  
  // Stats actions
  setTodayRevenue: (revenue: number) => void;
  setTodayTransactionsCount: (count: number) => void;
  setAverageTransactionValue: (avg: number) => void;
  
  // Filter actions
  setDateRange: (start: Date | null, end: Date | null) => void;
  setPaymentMethodFilter: (method: string | null) => void;
  setStatusFilter: (status: string | null) => void;
  clearFilters: () => void;
  
  // Pagination actions
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  setTotalTransactions: (total: number) => void;
  
  // Loading actions
  setIsLoading: (loading: boolean) => void;
  
  // Helper computed values
  filteredTransactions: Transaction[];
  totalPages: number;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  // Initial state
  transactions: [],
  recentTransactions: [],
  todayTransactions: [],
  
  todayRevenue: 0,
  todayTransactionsCount: 0,
  averageTransactionValue: 0,
  
  dateRange: { start: null, end: null },
  paymentMethodFilter: null,
  statusFilter: null,
  
  currentPage: 1,
  itemsPerPage: 20,
  totalTransactions: 0,
  
  isLoading: false,
  
  // Actions
  setTransactions: (transactions) => set({ transactions }),
  setRecentTransactions: (transactions) => set({ recentTransactions: transactions }),
  setTodayTransactions: (transactions) => set({ todayTransactions: transactions }),
  
  setTodayRevenue: (revenue) => set({ todayRevenue: revenue }),
  setTodayTransactionsCount: (count) => set({ todayTransactionsCount: count }),
  setAverageTransactionValue: (avg) => set({ averageTransactionValue: avg }),
  
  setDateRange: (start, end) => set({ 
    dateRange: { start, end },
    currentPage: 1 
  }),
  setPaymentMethodFilter: (method) => set({ 
    paymentMethodFilter: method,
    currentPage: 1 
  }),
  setStatusFilter: (status) => set({ 
    statusFilter: status,
    currentPage: 1 
  }),
  clearFilters: () => set({
    dateRange: { start: null, end: null },
    paymentMethodFilter: null,
    statusFilter: null,
    currentPage: 1
  }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  setItemsPerPage: (count) => set({ itemsPerPage: count, currentPage: 1 }),
  setTotalTransactions: (total) => set({ totalTransactions: total }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  // Computed values
  get filteredTransactions() {
    const { transactions, dateRange, paymentMethodFilter, statusFilter } = get();
    
    let filtered = [...transactions];
    
    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999); // End of day
      
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.created_at);
        return transactionDate >= start && transactionDate <= end;
      });
    }
    
    // Apply payment method filter
    if (paymentMethodFilter) {
      filtered = filtered.filter(transaction => 
        transaction.payment_method === paymentMethodFilter
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(transaction => 
        transaction.status === statusFilter
      );
    }
    
    return filtered;
  },
  
  get totalPages() {
    const { itemsPerPage, totalTransactions } = get();
    return Math.ceil(totalTransactions / itemsPerPage);
  }
}));

// Helper hooks
export const useTransactionStats = () => {
  const todayRevenue = useTransactionStore((state) => state.todayRevenue);
  const todayTransactionsCount = useTransactionStore((state) => state.todayTransactionsCount);
  const averageTransactionValue = useTransactionStore((state) => state.averageTransactionValue);
  
  return {
    todayRevenue,
    todayTransactionsCount,
    averageTransactionValue
  };
};