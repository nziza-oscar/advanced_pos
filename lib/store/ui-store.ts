import { create } from 'zustand';

interface UIState {
  // Sidebar state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Scanning
  isScanning: boolean;
  lastScannedBarcode: string;
  scanError: string | null;
  startScanning: () => void;
  stopScanning: () => void;
  setLastScannedBarcode: (barcode: string) => void;
  setScanError: (error: string | null) => void;
  
  // Notifications
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
  
  // Loading states
  isLoading: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Active tab
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
      notifications: [newNotification, ...state.notifications].slice(0, 5) // Keep last 5
    }));
    
    // Auto remove after 5 seconds
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

export const useScanState = () => {
  const isScanning = useUIStore((state) => state.isScanning);
  const lastScannedBarcode = useUIStore((state) => state.lastScannedBarcode);
  const scanError = useUIStore((state) => state.scanError);
  const startScanning = useUIStore((state) => state.startScanning);
  const stopScanning = useUIStore((state) => state.stopScanning);
  const setLastScannedBarcode = useUIStore((state) => state.setLastScannedBarcode);
  const setScanError = useUIStore((state) => state.setScanError);
  
  return {
    isScanning,
    lastScannedBarcode,
    scanError,
    startScanning,
    stopScanning,
    setLastScannedBarcode,
    setScanError
  };
};