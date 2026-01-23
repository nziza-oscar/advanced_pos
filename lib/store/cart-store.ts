import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  product_id: string;
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  max_quantity?: number; // Available stock
  image_url?: string;
}

interface CartStore {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  paymentMethod: 'cash' | 'momo' | 'card' | 'bank';
  momoPhone: string;
  notes: string;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setCustomerInfo: (name: string, phone: string) => void;
  setPaymentMethod: (method: 'cash' | 'momo' | 'card' | 'bank') => void;
  setMomoPhone: (phone: string) => void;
  setNotes: (notes: string) => void;
  
  // Computed values
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // Settings
  taxRate: number;
  discountRate: number;
  setTaxRate: (rate: number) => void;
  setDiscountRate: (rate: number) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customerName: '',
      customerPhone: '',
      paymentMethod: 'cash',
      momoPhone: '',
      notes: '',
      taxRate: 0.15, // 15% VAT
      discountRate: 0,

      // Computed values
      get subtotal() {
        return get().items.reduce(
          (total, item) => total + (item.price * item.quantity),
          0
        );
      },

      get taxAmount() {
        return get().subtotal * get().taxRate;
      },

      get discountAmount() {
        return get().subtotal * get().discountRate;
      },

      get totalAmount() {
        return get().subtotal + get().taxAmount - get().discountAmount;
      },

      // Actions
      addItem: (newItem) => {
        const { items } = get();
        const existingItem = items.find(item => item.product_id === newItem.product_id);

        if (existingItem) {
          // Update quantity if item already exists
          const newQuantity = existingItem.quantity + (newItem.quantity || 1);
          const finalQuantity = newItem.max_quantity 
            ? Math.min(newQuantity, newItem.max_quantity)
            : newQuantity;
          
          set({
            items: items.map(item =>
              item.product_id === newItem.product_id
                ? { ...item, quantity: finalQuantity }
                : item
            )
          });
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                ...newItem,
                quantity: newItem.quantity || 1
              }
            ]
          });
        }
      },

      updateItemQuantity: (id, quantity) => {
        const { items } = get();
        const item = items.find(item => item.id === id);
        
        if (!item) return;

        const finalQuantity = item.max_quantity 
          ? Math.min(quantity, item.max_quantity)
          : Math.max(1, quantity); // Minimum 1

        set({
          items: items.map(item =>
            item.id === id ? { ...item, quantity: finalQuantity } : item
          )
        });
      },

      removeItem: (id) => {
        set({
          items: get().items.filter(item => item.id !== id)
        });
      },

      clearCart: () => {
        set({
          items: [],
          customerName: '',
          customerPhone: '',
          momoPhone: '',
          notes: ''
        });
      },

      setCustomerInfo: (name, phone) => {
        set({ customerName: name, customerPhone: phone });
      },

      setPaymentMethod: (method) => {
        set({ 
          paymentMethod: method,
          momoPhone: method !== 'momo' ? '' : get().momoPhone
        });
      },

      setMomoPhone: (phone) => {
        set({ momoPhone: phone });
      },

      setNotes: (notes) => {
        set({ notes });
      },

      setTaxRate: (rate) => {
        set({ taxRate: rate });
      },

      setDiscountRate: (rate) => {
        set({ discountRate: rate });
      }
    }),
    {
      name: 'pos-cart-storage',
      partialize: (state) => ({
        items: state.items,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        paymentMethod: state.paymentMethod,
        momoPhone: state.momoPhone,
        notes: state.notes,
        taxRate: state.taxRate,
        discountRate: state.discountRate
      })
    }
  )
);

// Helper hooks
export const useCartSummary = () => {
  const subtotal = useCartStore((state) => state.subtotal);
  const taxAmount = useCartStore((state) => state.taxAmount);
  const discountAmount = useCartStore((state) => state.discountAmount);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const itemsCount = useCartStore((state) => state.items.length);

  return {
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    itemsCount
  };
};