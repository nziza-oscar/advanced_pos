import { api, ApiResponse, PaginationParams, DateRangeParams, SearchParams, FilterParams } from './axios-config';

// Helper function to build query params
export function buildQueryParams(
  pagination?: PaginationParams,
  dateRange?: DateRangeParams,
  search?: SearchParams,
  filters?: FilterParams
): Record<string, any> {
  const params: Record<string, any> = {};
  
  // Pagination
  if (pagination) {
    if (pagination.page !== undefined) params.page = pagination.page;
    if (pagination.limit !== undefined) params.limit = pagination.limit;
    if (pagination.sortBy !== undefined) params.sortBy = pagination.sortBy;
    if (pagination.sortOrder !== undefined) params.sortOrder = pagination.sortOrder;
  }
  
  // Date range
  if (dateRange) {
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
  }
  
  // Search
  if (search) {
    if (search.search) params.search = search.search;
    if (search.q) params.q = search.q;
    if (search.query) params.query = search.query;
  }
  
  // Filters
  if (filters) {
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;
    if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;
    if (filters.inStock !== undefined) params.inStock = filters.inStock;
    if (filters.lowStock !== undefined) params.lowStock = filters.lowStock;
  }
  
  return params;
}

// Helper to handle file uploads
export async function uploadFile(
  file: File, 
  endpoint: string = '/upload/image',
  fieldName: string = 'file'
): Promise<ApiResponse<{ url: string; path: string; filename: string }>> {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// Helper to handle bulk operations
export async function bulkOperation<T>(
  items: T[],
  endpoint: string,
  operation: 'create' | 'update' | 'delete'
): Promise<ApiResponse<{ success: number; failed: number; errors: string[] }>> {
  return api.post(endpoint, { items, operation });
}

// Helper to download files
export function downloadFile(url: string, filename?: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper to export data
export async function exportData(
  endpoint: string,
  format: 'csv' | 'excel' | 'pdf' = 'csv',
  params?: any
): Promise<void> {
  try {
    const response = await api.get(endpoint, {
      ...params,
      format
    }, {
      responseType: 'blob'
    });
    
    if (response.success && response.data) {
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 
               format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv'
      });
      
      const url = window.URL.createObjectURL(blob);
      downloadFile(url, `export-${new Date().toISOString().split('T')[0]}.${format}`);
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

// Helper to handle API errors in UI
export function handleApiError(error: any, defaultMessage: string = 'An error occurred'): string {
  if (error?.error) {
    return error.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return defaultMessage;
}

// Helper to format API error for display
export function formatApiError(error: any): {
  title: string;
  message: string;
  details?: string[];
} {
  if (error?.validationErrors) {
    const errors = Object.entries(error.validationErrors)
      .flatMap(([field, messages]) => 
        (messages as string[]).map(msg => `${field}: ${msg}`)
      );
    
    return {
      title: 'Validation Error',
      message: 'Please check the following fields:',
      details: errors
    };
  }
  
  if (error?.error) {
    return {
      title: 'Error',
      message: error.error
    };
  }
  
  return {
    title: 'Error',
    message: 'An unexpected error occurred'
  };
}