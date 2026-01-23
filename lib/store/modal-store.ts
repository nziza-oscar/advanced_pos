import { create } from 'zustand';

export type ModalType = 
  | 'checkout' 
  | 'add-product' 
  | 'edit-product' 
  | 'transaction-details'
  | 'payment'
  | 'scanner'
  | 'confirmation'
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
  
  // Confirmation modal
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  
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

// Helper hooks for specific modals
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

export const useConfirmationModal = () => {
  const openModal = useModalStore((state) => state.openModal);
  
  const openConfirmationModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    openModal('confirmation', {
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText
    });
  };
  
  return { openConfirmationModal };
};