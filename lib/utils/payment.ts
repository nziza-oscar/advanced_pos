/**
 * Calculate change amount
 */
export function calculateChange(amountPaid: number, totalAmount: number): number {
  return Math.max(0, amountPaid - totalAmount);
}

/**
 * Validate payment method
 */
export function validatePaymentMethod(method: string): boolean {
  const validMethods = ['cash', 'momo', 'card', 'bank'];
  return validMethods.includes(method.toLowerCase());
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Generate receipt data
 */
export function generateReceiptData(transaction: any) {
  return {
    transaction_number: transaction.transaction_number,
    date: new Date(transaction.created_at).toLocaleString(),
    items: transaction.items.map((item: any) => ({
      name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total_price
    })),
    subtotal: transaction.subtotal,
    tax: transaction.tax_amount,
    discount: transaction.discount_amount,
    total: transaction.total_amount,
    amount_paid: transaction.amount_paid,
    change: transaction.change_amount,
    payment_method: transaction.payment_method,
    cashier: transaction.cashier?.full_name || 'System'
  };
}