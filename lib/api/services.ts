import apiClient, { API_ENDPOINTS, ApiResponse } from './axios-config';

// Product Service
export const productService = {
  // Get all products
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    inStock?: boolean;
  }): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS, { params });
    return response.data;
  },
  
  // Get product by ID
  getProductById: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCT_BY_ID(id));
    return response.data;
  },
  
  // Get product by barcode
  getProductByBarcode: async (barcode: string): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCT_BY_BARCODE(barcode));
    return response.data;
  },
  
  // Create product
  createProduct: async (productData: any): Promise<ApiResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTS, productData);
    return response.data;
  },
  
  // Update product
  updateProduct: async (id: string, productData: any): Promise<ApiResponse> => {
    const response = await apiClient.put(API_ENDPOINTS.PRODUCT_BY_ID(id), productData);
    return response.data;
  },
  
  // Delete product (soft delete)
  deleteProduct: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(API_ENDPOINTS.PRODUCT_BY_ID(id));
    return response.data;
  },
  
  // Update stock
  updateStock: async (id: string, stockQuantity: number): Promise<ApiResponse> => {
    const response = await apiClient.patch(`/products/${id}/stock`, { stockQuantity });
    return response.data;
  },
  
  // Search products
  searchProducts: async (searchTerm: string): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS, {
      params: { search: searchTerm }
    });
    return response.data;
  }
};

// Transaction Service
export const transactionService = {
  // Get all transactions
  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    paymentMethod?: string;
  }): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.TRANSACTIONS, { params });
    return response.data;
  },
  
  // Get transaction by ID
  getTransactionById: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.TRANSACTION_BY_ID(id));
    return response.data;
  },
  
  // Create transaction
  createTransaction: async (transactionData: any): Promise<ApiResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.TRANSACTIONS, transactionData);
    return response.data;
  },
  
  // Process cash payment
  processCashPayment: async (paymentData: {
    transaction_id: string;
    amount_paid: number;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
  }): Promise<ApiResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENT_CASH, paymentData);
    return response.data;
  },
  
  // Process MOMO payment
  processMomoPayment: async (paymentData: {
    transaction_id: string;
    momo_phone: string;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
  }): Promise<ApiResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENT_MOMO, paymentData);
    return response.data;
  },
  
  // Refund transaction
  refundTransaction: async (id: string, reason?: string): Promise<ApiResponse> => {
    const response = await apiClient.post(`/transactions/${id}/refund`, { reason });
    return response.data;
  },
  
  // Get today's transactions
  getTodayTransactions: async (): Promise<ApiResponse> => {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get(API_ENDPOINTS.TRANSACTIONS, {
      params: { 
        startDate: today,
        endDate: today,
        limit: 50 
      }
    });
    return response.data;
  },
  
  // Get recent transactions
  getRecentTransactions: async (limit = 10): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.TRANSACTIONS, {
      params: { limit, sort: 'created_at:desc' }
    });
    return response.data;
  }
};

// Category Service
export const categoryService = {
  // Get all categories
  getCategories: async (): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES);
    return response.data;
  },
  
  // Get category by ID
  getCategoryById: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORY_BY_ID(id));
    return response.data;
  },
  
  // Create category
  createCategory: async (categoryData: any): Promise<ApiResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.CATEGORIES, categoryData);
    return response.data;
  },
  
  // Update category
  updateCategory: async (id: string, categoryData: any): Promise<ApiResponse> => {
    const response = await apiClient.put(API_ENDPOINTS.CATEGORY_BY_ID(id), categoryData);
    return response.data;
  },
  
  // Delete category
  deleteCategory: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(API_ENDPOINTS.CATEGORY_BY_ID(id));
    return response.data;
  }
};

// Report Service
export const reportService = {
  // Get daily report
  getDailyReport: async (date?: string): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS_DAILY, {
      params: { date }
    });
    return response.data;
  },
  
  // Get weekly report
  getWeeklyReport: async (week?: string): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS_WEEKLY, {
      params: { week }
    });
    return response.data;
  },
  
  // Get monthly report
  getMonthlyReport: async (month?: string): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS_MONTHLY, {
      params: { month }
    });
    return response.data;
  },
  
  // Get sales report
  getSalesReport: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month' | 'category' | 'product';
  }): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS_SALES, { params });
    return response.data;
  },
  
  // Get inventory report
  getInventoryReport: async (): Promise<ApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS_INVENTORY);
    return response.data;
  }
};

// User Service
export const userService = {
  // Login
  login: async (credentials: { username: string; password: string }): Promise<ApiResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },
  
  // Logout
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.LOGOUT);
    return response.data;
  },
  
  // Get current user
  getCurrentUser: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  
  // Update profile
  updateProfile: async (userData: any): Promise<ApiResponse> => {
    const response = await apiClient.put('/auth/profile', userData);
    return response.data;
  }
};



// Auth Service
export const authService = {
  // Signup
  signup: async (userData: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
  },
  
  // Login
  login: async (credentials: { username: string; password: string }): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/signin', credentials);
    return response.data;
  },
  
  // Logout
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
  
  // Get current user
  getCurrentUser: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  
  // Update profile
  updateProfile: async (userData: any): Promise<ApiResponse> => {
    const response = await apiClient.put('/auth/profile', userData);
    return response.data;
  },
  
  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    const response = await apiClient.put('/auth/change-password', passwordData);
    return response.data;
  }
};

// Update the apiService export
export const apiService = {
  products: productService,
  transactions: transactionService,
  categories: categoryService,
  reports: reportService,
  auth: authService,
  users: userService
};