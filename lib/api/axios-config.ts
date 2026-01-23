import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (client-side) or cookies (server-side)
    let token: string | null = null;
    
    if (typeof window !== 'undefined') {
      // Client-side: get from localStorage
      token = localStorage.getItem('token');
      
      // Fallback to cookies if localStorage doesn't have token
      if (!token) {
        const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
        if (match) token = match[2];
      }
    } else {
      // Server-side: token should be passed via context
      // For API routes, we'll rely on cookies
    }
    
    // Add token to headers if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching for GET requests
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    // Add CSRF token if available (for additional security)
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Store token if returned in response (for login/signup)
    if (response.data?.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.data.token);
      // Also set cookie for server-side access
      document.cookie = `token=${response.data.data.token}; path=/; max-age=${60 * 60 * 24}`;
    }
    
    // Extract data from standard API response format
    if (response.data && typeof response.data === 'object') {
      // If response already has our standard format, return as-is
      if ('success' in response.data) {
        return response;
      }
      
      // Wrap non-standard responses in our format
      return {
        ...response,
        data: {
          success: true,
          data: response.data,
          message: response.statusText
        }
      };
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      
      if (typeof window !== 'undefined') {
        // Show network error notification
        const event = new CustomEvent('show-notification', {
          detail: {
            type: 'error',
            title: 'Network Error',
            message: 'Please check your internet connection'
          }
        });
        window.dispatchEvent(event);
      }
      
      return Promise.reject({
        success: false,
        error: 'Network error. Please check your connection.',
        data: null
      });
    }
    
    const { status, data } = error.response;
    
    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        console.error('Bad Request:', data);
        break;
        
      case 401:
        console.error('Unauthorized access');
        
        // Clear stored token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        
        // Redirect to login if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
        break;
        
      case 403:
        console.error('Forbidden access');
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('show-notification', {
            detail: {
              type: 'error',
              title: 'Access Denied',
              message: 'You do not have permission to access this resource'
            }
          });
          window.dispatchEvent(event);
        }
        break;
        
      case 404:
        console.error('Resource not found');
        break;
        
      case 409:
        console.error('Conflict:', data);
        break;
        
      case 422:
        console.error('Validation error:', data);
        break;
        
      case 429:
        console.error('Rate limit exceeded');
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('show-notification', {
            detail: {
              type: 'warning',
              title: 'Too Many Requests',
              message: 'Please wait a moment before trying again'
            }
          });
          window.dispatchEvent(event);
        }
        break;
        
      case 500:
        console.error('Server error:', data);
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('show-notification', {
            detail: {
              type: 'error',
              title: 'Server Error',
              message: 'Something went wrong on our end. Please try again later.'
            }
          });
          window.dispatchEvent(event);
        }
        break;
        
      default:
        console.error(`API Error (${status}):`, data);
    }
    
    // Return standardized error response
    return Promise.reject({
      success: false,
      error: data?.error || `Request failed with status ${status}`,
      message: data?.message,
      validationErrors: data?.errors,
      status,
      data: null
    });
  }
);

// Helper function to get CSRF token from meta tag
function getCsrfToken(): string | null {
  if (typeof window !== 'undefined') {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag?.getAttribute('content') || null;
  }
  return null;
}

// API endpoints configuration
export const API_ENDPOINTS = {
  // Auth
  AUTH_SIGNUP: '/auth/signup',
  AUTH_SIGNIN: '/auth/signin',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_CHANGE_PASSWORD: '/auth/change-password',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  PRODUCT_BY_BARCODE: (barcode: string) => `/barcode?barcode=${barcode}`,
  PRODUCT_SEARCH: (query: string) => `/products/search?q=${query}`,
  PRODUCT_BULK_UPDATE: '/products/bulk',
  PRODUCT_IMPORT: '/products/import',
  PRODUCT_EXPORT: '/products/export',
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
  CATEGORY_TREE: '/categories/tree',
  
  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTION_BY_ID: (id: string) => `/transactions/${id}`,
  TRANSACTION_RECENT: '/transactions/recent',
  TRANSACTION_TODAY: '/transactions/today',
  TRANSACTION_REFUND: (id: string) => `/transactions/${id}/refund`,
  TRANSACTION_PRINT: (id: string) => `/transactions/${id}/print`,
  TRANSACTION_EXPORT: '/transactions/export',
  
  // Payments
  PAYMENT_CASH: '/payment/cash',
  PAYMENT_MOMO: '/payment/momo',
  PAYMENT_CARD: '/payment/card',
  PAYMENT_BANK: '/payment/bank',
  PAYMENT_STATUS: (id: string) => `/payment/${id}/status`,
  PAYMENT_WEBHOOK: '/payment/webhook/momo',
  
  // Inventory
  INVENTORY: '/inventory',
  INVENTORY_LOW_STOCK: '/inventory/low-stock',
  INVENTORY_ALERTS: '/inventory/alerts',
  INVENTORY_ADJUSTMENT: '/inventory/adjust',
  INVENTORY_HISTORY: '/inventory/history',
  
  // Barcode
  BARCODE_SCAN: '/barcode/scan',
  BARCODE_GENERATE: '/barcode/generate',
  BARCODE_BULK_GENERATE: '/barcode/bulk-generate',
  BARCODE_VALIDATE: '/barcode/validate',
  
  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_PROFILE: '/users/profile',
  USER_ROLES: '/users/roles',
  USER_PERMISSIONS: '/users/permissions',
  
  // Settings
  SETTINGS: '/settings',
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_TAX: '/settings/tax',
  SETTINGS_RECEIPT: '/settings/receipt',
  SETTINGS_PRINTER: '/settings/printer',
  SETTINGS_PAYMENT: '/settings/payment',
  
  // Reports
  REPORTS_DAILY: '/reports/daily',
  REPORTS_WEEKLY: '/reports/weekly',
  REPORTS_MONTHLY: '/reports/monthly',
  REPORTS_SALES: '/reports/sales',
  REPORTS_INVENTORY: '/reports/inventory',
  REPORTS_CUSTOMER: '/reports/customer',
  REPORTS_PRODUCT: '/reports/product',
  REPORTS_PAYMENT: '/reports/payment',
  REPORTS_EXPORT: (type: string) => `/reports/export/${type}`,
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_CHARTS: '/dashboard/charts',
  DASHBOARD_RECENT_ACTIVITY: '/dashboard/recent-activity',
  DASHBOARD_QUICK_STATS: '/dashboard/quick-stats',
  
  // Uploads
  UPLOAD_IMAGE: '/upload/image',
  UPLOAD_PRODUCT_IMAGE: '/upload/product',
  UPLOAD_BULK: '/upload/bulk',
  
  // Backup
  BACKUP_CREATE: '/backup/create',
  BACKUP_LIST: '/backup/list',
  BACKUP_RESTORE: '/backup/restore',
  BACKUP_DOWNLOAD: (filename: string) => `/backup/download/${filename}`,
  
  // System
  SYSTEM_INFO: '/system/info',
  SYSTEM_HEALTH: '/system/health',
  SYSTEM_LOGS: '/system/logs',
  SYSTEM_CLEAR_CACHE: '/system/clear-cache'
};

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    version: string;
    timestamp: string;
    requestId: string;
  };
  validationErrors?: Record<string, string[]>;
}

// Request parameter types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface SearchParams {
  search?: string;
  q?: string;
  query?: string;
}

export interface FilterParams {
  category?: string;
  status?: string;
  paymentMethod?: string;
  isActive?: boolean;
  inStock?: boolean;
  lowStock?: boolean;
}

// Generic API request function
export async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any,
  config?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request({
      method,
      url,
      data,
      ...config
    });
    
    return response.data;
  } catch (error: any) {
    // If error is already in our ApiResponse format, return it
    if (error.success !== undefined) {
      return error;
    }
    
    // Otherwise, wrap in ApiResponse format
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      data: undefined
    };
  }
}

// Convenience methods
export const api = {
  get: <T = any>(url: string, params?: any, config?: any) => 
    apiRequest<T>('GET', url, undefined, { params, ...config }),
  
  post: <T = any>(url: string, data?: any, config?: any) => 
    apiRequest<T>('POST', url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: any) => 
    apiRequest<T>('PUT', url, data, config),
  
  patch: <T = any>(url: string, data?: any, config?: any) => 
    apiRequest<T>('PATCH', url, data, config),
  
  delete: <T = any>(url: string, config?: any) => 
    apiRequest<T>('DELETE', url, undefined, config)
};

// Type for paginated responses
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Type for file upload responses
export interface UploadResponse {
  url: string;
  path: string;
  filename: string;
  size: number;
  mimetype: string;
}

// Type for dashboard stats
export interface DashboardStats {
  today: {
    revenue: number;
    transactions: number;
    customers: number;
    productsSold: number;
  };
  weekly: {
    revenue: number;
    growth: number;
  };
  monthly: {
    revenue: number;
    growth: number;
  };
  inventory: {
    totalProducts: number;
    lowStock: number;
    outOfStock: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    quantity: number;
  }>;
  recentTransactions: Array<{
    id: string;
    transaction_number: string;
    total_amount: number;
    payment_method: string;
    customer_name?: string;
    created_at: string;
  }>;
}

// Export everything
export default apiClient;
export { apiClient as axios };