import { useState, useEffect, useCallback } from 'react';
import { useUIStore, useModalStore } from '@/lib/store';
import { toast } from 'sonner';

export function useBarcodeScanner() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const {
    isScanning,
    startScanning,
    stopScanning,
    setLastScannedBarcode,
    setScanError
  } = useUIStore();
  const { openModal, closeModal } = useModalStore();

  // Handle barcode input (keyboard wedge scanner or manual input)
  const handleBarcodeInput = useCallback(async (barcode: string) => {
    if (!barcode.trim()) return;

    const cleanBarcode = barcode.trim();
    setScannedData(cleanBarcode);
    setLastScannedBarcode(cleanBarcode);
    
    try {
      // Call API to get product info
      const response = await fetch(`/api/barcode?barcode=${encodeURIComponent(cleanBarcode)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 404) {
          // Product not found, open add product modal
          openModal('add-product', {
            product: {
              barcode: cleanBarcode,
              name: '',
              price: 0,
              stock_quantity: 0
            }
          });
          toast.error('Product not found. Please add it to inventory.');
        } else {
          toast.error(errorData.error || 'Failed to scan product');
        }
        return;
      }

      const data = await response.json();
      
      // Open checkout modal with product data
      openModal('checkout', {
        product: data.product
      });
      
      // Play success sound (optional)
      playScanSound('success');
      
    } catch (error) {
      console.error('Barcode scan error:', error);
      setScanError('Failed to process barcode scan');
      toast.error('Failed to process barcode');
      playScanSound('error');
    }
  }, [openModal, setLastScannedBarcode, setScanError]);

  // Play scan sound
  const playScanSound = useCallback((type: 'success' | 'error') => {
    if (typeof window !== 'undefined') {
      const audio = new Audio(`/sounds/scan-${type}.mp3`);
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silent fail for audio
      });
    }
  }, []);

  // Simulate scanner input (for testing without actual scanner)
  const simulateScan = useCallback((testBarcode: string) => {
    handleBarcodeInput(testBarcode);
  }, [handleBarcodeInput]);

  // Initialize scanner (listen for keyboard input)
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      
      // Focus on search input when scanning starts
      if (isScanning) {
        const searchInput = document.querySelector('input[type="search"], input[data-scanner-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.value = '';
        }
      }
    }
  }, [isScanning, isInitialized]);

  // Handle keyboard input for barcode scanning
  useEffect(() => {
    let inputBuffer = '';
    let lastKeyTime = Date.now();
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if modal is open (except checkout modal)
      const modal = document.querySelector('[data-modal]');
      if (modal && !modal.hasAttribute('data-checkout-modal')) {
        return;
      }

      // Check if it's a barcode scanner input (usually rapid keypresses with Enter at the end)
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      
      // Reset buffer if too much time has passed between keystrokes (not a scanner)
      if (timeDiff > 100) {
        inputBuffer = '';
      }
      
      lastKeyTime = currentTime;
      
      // If Enter is pressed, process the barcode
      if (event.key === 'Enter' && inputBuffer.length > 0) {
        event.preventDefault();
        handleBarcodeInput(inputBuffer);
        inputBuffer = '';
        return;
      }
      
      // Ignore modifier keys and special keys
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        inputBuffer += event.key;
        
        // Auto-process if buffer gets too long (scanners usually send data quickly)
        if (inputBuffer.length > 20) {
          handleBarcodeInput(inputBuffer);
          inputBuffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleBarcodeInput]);

  return {
    isScanning,
    scannedData,
    startScanning,
    stopScanning,
    handleBarcodeInput,
    simulateScan,
    playScanSound
  };
}