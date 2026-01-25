'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useModalStore } from '@/lib/store/modal-store';
import { Scan, X, Loader2 } from 'lucide-react';

export function BarcodeScanner() {
  const { isOpen, type, closeModal, openModal } = useModalStore();
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isScannerModalOpen = isOpen && type === 'scanner';

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isScannerModalOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        setBarcode(''); // Clear previous barcode
      }, 100);
    }
  }, [isScannerModalOpen]);

  const handleScan = async (scannedBarcode?: string) => {
    const codeToScan = scannedBarcode || barcode.trim();
    
    if (!codeToScan) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/barcode?barcode=${codeToScan}`);
      const data = await res.json();
      
      if (data.success) {
        // Close scanner modal
        closeModal();
        
        // Open checkout modal with product
        setTimeout(() => {
          openModal('checkout', { product: data.data });
        }, 100);
        
      } else {
        // Product not found - open add product modal
        closeModal();
        setTimeout(() => {
          openModal('add-product', { 
            product: {
              barcode: codeToScan,
              name: '',
              price: 0,
              stock_quantity: 0
            }
          });
        }, 100);
      }
    } catch (error) {
      console.error('Scan error:', error);
    } finally {
      setLoading(false);
      setBarcode('');
    }
  };

  // Auto-scan when barcode is 13 digits (typical length)
  const handleInputChange = (value: string) => {
    setBarcode(value);
    
    // Auto-scan when barcode reaches typical length
    if (value.length === 13 || value.length === 12 || value.length === 8) {
      handleScan(value);
    }
  };

  // Handle keyboard shortcut (Alt+S to open scanner)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.altKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (!isScannerModalOpen) {
          useModalStore.getState().openModal('scanner');
        }
      }
      
      // ESC to close
      if (event.key === 'Escape' && isScannerModalOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScannerModalOpen, closeModal]);

  // Handle keyboard wedge scanner (rapid entry)
  useEffect(() => {
    let inputBuffer = '';
    let lastKeyTime = Date.now();
    
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if scanner modal is not open
      if (!isScannerModalOpen) return;
      
      // Ignore modifier keys
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      
      // Reset buffer if too much time passed (not a scanner)
      if (timeDiff > 100) {
        inputBuffer = '';
      }
      
      lastKeyTime = currentTime;
      
      // If Enter is pressed, process the barcode
      if (event.key === 'Enter' && inputBuffer.length > 0) {
        event.preventDefault();
        handleScan(inputBuffer);
        inputBuffer = '';
        return;
      }
      
      // Collect alphanumeric characters
      if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
        inputBuffer += event.key;
        
        // Auto-process if buffer gets too long
        if (inputBuffer.length > 20) {
          handleScan(inputBuffer);
          inputBuffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isScannerModalOpen]);

  if (!isScannerModalOpen) return null;

  return (
    <Dialog open={isScannerModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Scan Barcode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Scanner Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              #
            </div>
            <Input
              ref={inputRef}
              value={barcode}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Scan barcode or type here..."
              className="pl-10 pr-10 text-center font-mono text-lg"
              disabled={loading}
              autoFocus
            />
            {barcode && (
              <button
                onClick={() => setBarcode('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status */}
          <div className="text-center">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Point scanner at barcode or type manually
              </div>
            )}
          </div>

          {/* Test Barcodes */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2 text-gray-600">Test Barcodes:</h4>
            <div className="flex flex-wrap gap-2">
              {['1234567890123', '2345678901234', '3456789012345'].map((testBarcode) => (
                <Button
                  key={testBarcode}
                  variant="outline"
                  size="sm"
                  onClick={() => handleScan(testBarcode)}
                  disabled={loading}
                  className="text-xs"
                >
                  {testBarcode}
                </Button>
              ))}
            </div>
          </div>

          {/* Manual Scan Button */}
          <Button
            onClick={() => handleScan()}
            disabled={loading || !barcode.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Scan className="w-4 h-4 mr-2" />
                Scan Barcode
              </>
            )}
          </Button>

          {/* Help Text */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Press <kbd className="px-2 py-1 bg-gray-100 rounded border">Alt+S</kbd> to open scanner anytime</p>
            <p>• Press <kbd className="px-2 py-1 bg-gray-100 rounded border">ESC</kbd> to close</p>
            <p>• Scanner will auto-detect barcode length</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}