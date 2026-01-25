'use client';

import { create } from 'zustand';

// Define the types for our modals to keep things type-safe
export type ModalType = 'add-product' | 'edit-product' | 'add-category' | 'edit-category' | null;

interface ModalData {
  product?: any;
  category?: any;
  apiUrl?: string;
}

interface UIState {
  // --- Sidebar state ---
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // --- Theme ---
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // --- Modal Management (NEW) ---
  isOpen: boolean;
  modalType: ModalType;
  modalData: ModalData;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;

  // --- Scanning ---
  isScanning: boolean;
  lastScannedBarcode: string;
  scanError: string | null;
  startScanning: () => void;
  stopScanning: () => void;
  setLastScannedBarcode: (barcode: string) => void;
  setScanError: (error: string | null) => void;
  
  // --- Notifications ---
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    timestamp: Date;
  }>;
  addNotification: (
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message: string
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // --- Loading states ---
  isLoading: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
  
  // --- Search & Tabs ---
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Sidebar
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  
  // Theme
  theme: 'light',
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  setTheme: (theme) => set({ theme }),

  // Modal Management Logic
  isOpen: false,
  modalType: null,
  modalData: {},
  openModal: (type, data = {}) => set({ 
    isOpen: true, 
    modalType: type, 
    modalData: data 
  }),
  closeModal: () => set({ 
    isOpen: false, 
    modalType: null, 
    modalData: {} 
  }),
  
  // Scanning
  isScanning: false,
  lastScannedBarcode: '',
  scanError: null,
  startScanning: () => set({ isScanning: true, scanError: null }),
  stopScanning: () => set({ isScanning: false }),
  setLastScannedBarcode: (barcode) => set({ 
    lastScannedBarcode: barcode,
    scanError: null
  }),
  setScanError: (error) => set({ scanError: error }),
  
  // Notifications
  notifications: [],
  addNotification: (type, title, message) => {
    const newNotification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date()
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 5)
    }));
    
    setTimeout(() => {
      get().removeNotification(newNotification.id);
    }, 5000);
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(notif => notif.id !== id)
    }));
  },
  clearNotifications: () => set({ notifications: [] }),
  
  // Loading states
  isLoading: {},
  setLoading: (key, loading) => {
    set((state) => ({
      isLoading: { ...state.isLoading, [key]: loading }
    }));
  },
  
  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Active tab
  activeTab: 'pos',
  setActiveTab: (tab) => set({ activeTab: tab })
}));

// Helper hooks
export const useIsLoading = (key: string) => {
  return useUIStore((state) => state.isLoading[key] || false);
};

export const useModal = () => {
  const { isOpen, modalType, modalData, openModal, closeModal } = useUIStore();
  return { isOpen, modalType, modalData, openModal, closeModal };
};