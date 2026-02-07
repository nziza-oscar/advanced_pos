import { create } from 'zustand';

export interface StaffMember {
  id: string;
  email: string;
  username: string;
  full_name: string; // Used in page
  name?: string;     // Fallback for compatibility
  role: 'admin' | 'manager' | 'cashier' | 'inventory_manager' | 'staff';
  is_active: boolean;
  status?: 'active' | 'inactive'; // Fallback for compatibility
  last_login?: string | null;
  created_at?: string;
}

export type ModalType = 
  | 'checkout' 
  | 'add-product' 
  | 'edit-product' 
  | 'transaction-details'
  | 'payment'
  | 'scanner'
  | 'confirmation'
  | 'add-staff'
  | 'edit-staff'
  | null;

export interface ModalData {
  // Checkout modal
  product?: {
    id: string;
    barcode: string;
    name: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
  };
  
  // Product modal
  productId?: string;
  
  // Transaction modal
  transactionId?: string;
  
  // Staff modal
  staff?: StaffMember;
  
  // Confirmation modal
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary';
  
  // Payment modal
  amount?: number;
}

interface ModalStore {
  type: ModalType;
  data: ModalData;
  isOpen: boolean;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
  updateModalData: (data: Partial<ModalData>) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,

  openModal: (type, data = {}) => {
    set({ type, data, isOpen: true });
  },

  closeModal: () => {
    set({ type: null, data: {}, isOpen: false });
  },

  updateModalData: (newData) => {
    set((state) => ({
      data: { ...state.data, ...newData }
    }));
  }
}));

// Helper hooks for specific modals to prevent repetition in components

export const useCheckoutModal = () => {
  const openModal = useModalStore((state) => state.openModal);
  
  const openCheckoutModal = (product: ModalData['product']) => {
    openModal('checkout', { product });
  };
  
  return { openCheckoutModal };
};

export const useScannerModal = () => {
  const openModal = useModalStore((state) => state.openModal);
  
  const openScannerModal = () => {
    openModal('scanner');
  };
  
  return { openScannerModal };
};

export const useStaffModal = () => {
  const openModal = useModalStore((state) => state.openModal);
  
  const openAddStaff = () => openModal('add-staff');
  const openEditStaff = (staff: StaffMember) => openModal('edit-staff', { staff });
  
  return { openAddStaff, openEditStaff };
};

export const useConfirmationModal = () => {
  const openModal = useModalStore((state) => state.openModal);
  
  const openConfirmationModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant: ModalData['confirmVariant'] = 'default'
  ) => {
    openModal('confirmation', {
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      confirmVariant
    });
  };
  
  return { openConfirmationModal };
};