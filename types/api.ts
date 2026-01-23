// Common API response types
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
  };
}

// Barcode API types
export interface BarcodeResponse {
  product: {
    id: string;
    barcode: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    stock_quantity: number;
    is_active: boolean;
  };
}

// Transaction types
export interface TransactionItemInput {
  product_id: string;
  barcode: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
}

export interface CreateTransactionInput {
  customer_name?: string;
  customer_phone?: string;
  items: TransactionItemInput[];
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  amount_paid: number;
  payment_method: 'cash' | 'momo' | 'card' | 'bank';
  momo_phone?: string;
  momo_transaction_id?: string;
  notes?: string;
  created_by?: string;
}

// Payment types
export interface CashPaymentInput {
  transaction_id: string;
  amount_paid: number;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
}

export interface MomoPaymentInput {
  transaction_id: string;
  momo_phone: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
}