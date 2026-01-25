'use client';

import React, { useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useModalStore, useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ScannerModal() {
  const { isOpen, type, closeModal } = useModalStore();
  const { addItem } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const handleScan = async (barcode: string) => {
    if (isProcessing || barcode === lastScanned) return;

    setIsProcessing(true);
    setLastScanned(barcode);

    try {
      // 1. Lookup product via API using the barcode
      const response = await fetch(`/api/products/barcode/${barcode}`);
      const result = await response.json();

      if (result.success && result.data) {
        const product = result.data;

        // 2. Add to Zustand Cart
        addItem({
          id: product.id,
          product_id: product.id,
          barcode: product.barcode,
          name: product.name,
          price: product.price,
          stock_quantity: product.stock_quantity
        });

        // 3. Show Success Feedback
        toast.success(`Added ${product.name}`, {
          description: `${Number(product.price).toLocaleString()} FRW`,
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        });

        // 4. Brief delay before allowing the next scan (Continuous Mode)
        setTimeout(() => {
          setIsProcessing(false);
          setLastScanned(null); // Reset to allow scanning the same item twice if needed
        }, 1500);

      } else {
        toast.error("Product not found", {
          description: `Barcode: ${barcode}`,
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        });
        setIsProcessing(false);
        setLastScanned(null);
      }
    } catch (error) {
      toast.error("Scanner Error");
      setIsProcessing(false);
      setLastScanned(null);
    }
  };

  if (isOpen && type === 'scanner') {
    return (
      <Dialog open={isOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              Continuous Scanner
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative aspect-square bg-black overflow-hidden mt-4">
            <BarcodeScannerComponent
              width="100%"
              height="100%"
              onUpdate={(err, result) => {
                if (result) handleScan(result.getText());
              }}
            />
            
            {/* Visual Feedback Overlays */}
            {isProcessing && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10 backdrop-blur-[2px]">
                <div className="bg-white rounded-full p-3 shadow-2xl scale-110 transition-transform">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>
            )}

            {/* Scanning Target Box */}
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                <div className="w-full h-full border-2 border-blue-500/50 relative">
                    {/* Laser Line */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_15px_red] animate-pulse" />
                </div>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">Scan items one by one</p>
                <Button variant="destructive" size="sm" onClick={closeModal}>
                  Finish Scanning
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return null;
}