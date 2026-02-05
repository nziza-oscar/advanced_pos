import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product_id: string;   // Matches backend item.product_id
  barcode: string;
  name: string;         // Used for UI
  product_name: string; // Matches backend item.product_name
  unit_price: number;   // Matches backend item.unit_price
  quantity: number;
  stock_quantity: number;
  image_url?: string;
}

interface CartStore {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  paymentMethod: 'cash' | 'momo' | 'card' | 'bank';
  momoPhone: string;
  notes: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  taxRate: number;
  discountRate: number;

  // Actions
  addItem: (product: any) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setCustomerInfo: (name: string, phone: string) => void;
  setPaymentMethod: (method: 'cash' | 'momo' | 'card' | 'bank') => void;
  setMomoPhone: (phone: string) => void;
  setNotes: (notes: string) => void;
  getCheckoutPayload: () => any; // Prepares data for your API
}

const calculateTotals = (items: CartItem[], taxRate: number, discountRate: number) => {
  const subtotal = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  const taxAmount = subtotal * taxRate;
  const discountAmount = subtotal * discountRate;
  const totalAmount = subtotal + taxAmount - discountAmount;
  return { subtotal, taxAmount, discountAmount, totalAmount };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customerName: '',
      customerPhone: '',
      paymentMethod: 'cash',
      momoPhone: '',
      notes: '',
      taxRate: 0.18, 
      discountRate: 0,
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,

      addItem: (product) => {
        const { items, taxRate, discountRate } = get();
        const existingItem = items.find((item) => item.product_id === product.id);

        let updatedItems;
        if (existingItem) {
          const newQuantity = existingItem.quantity + 1;
          if (newQuantity > product.stock_quantity){

           return false;
          }
         else{
          
           updatedItems = items.map((item) =>
            item.product_id === product.id ? { ...item, quantity: newQuantity } : item
          );
         }
        } else {
          updatedItems = [
            ...items,
            {
              product_id: product.id,
              barcode: product.barcode,
              name: product.name,
              product_name: product.name,
              unit_price: Number(product.price),
              stock_quantity: product.stock_quantity,
              image_url: product.image_url,
              quantity: 1,
            },
          ];
        }

        set({
          items: updatedItems,
          ...calculateTotals(updatedItems, taxRate, discountRate),
        });
        return true
      },

      updateQuantity: (productId, quantity) => {
        const { items, taxRate, discountRate } = get();
        const updatedItems = items.map((item) => {
          if (item.product_id === productId) {
            const finalQty = Math.min(Math.max(1, quantity), item.stock_quantity);
            return { ...item, quantity: finalQty };
          }
          return item;
        });

        set({
          items: updatedItems,
          ...calculateTotals(updatedItems, taxRate, discountRate),
        });
      },

      removeItem: (productId) => {
        const { items, taxRate, discountRate } = get();
        const updatedItems = items.filter((item) => item.product_id !== productId);
        set({
          items: updatedItems,
          ...calculateTotals(updatedItems, taxRate, discountRate),
        });
      },

      clearCart: () => set({
        items: [],
        customerName: '',
        customerPhone: '',
        momoPhone: '',
        notes: '',
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
      }),

      setCustomerInfo: (name, phone) => set({ customerName: name, customerPhone: phone }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setMomoPhone: (phone) => set({ momoPhone: phone }),
      setNotes: (notes) => set({ notes }),

      // This prepares the exact body for your POST /api/transactions
      getCheckoutPayload: () => {
        const state = get();
        return {
          items: state.items, // Array of {product_id, barcode, product_name, quantity, unit_price}
          subtotal: state.subtotal,
          tax_amount: state.taxAmount,
          discount_amount: state.discountAmount,
          total_amount: state.totalAmount,
          amount_paid: state.totalAmount, // Default to total
          payment_method: state.paymentMethod,
          momo_phone: state.momoPhone,
          customer_name: state.customerName || 'Walk-in Customer'
        };
      }
    }),
    { name: 'pos-cart-storage',version: 1 }
  )
);

export const useCartSummary = () => {
  const { subtotal, taxAmount, totalAmount, items } = useCartStore();
  return {
    subtotal,
    taxAmount,
    totalAmount,
    itemsCount: items.reduce((acc, item) => acc + item.quantity, 0),
  };
};