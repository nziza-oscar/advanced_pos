'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

  const scanSound = useMemo(() => {
    if (typeof window !== 'undefined') return new Audio('/sounds/freesound_community.mp3');
    return null;
  }, []);

  const errorSound = useMemo(() => {
    if (typeof window !== 'undefined') return new Audio('/sounds/error_music.mp3');
    return null;
  }, []);

  const playSuccessSound = () => {
    if (scanSound) {
      scanSound.currentTime = 0;
      scanSound.play().catch(() => {});
    }
  };

  const playErrorSound = () => {
    if (errorSound) {
      errorSound.currentTime = 0;
      errorSound.play().catch(() => {});
    }
  };

  const handleScan = async (barcode: string) => {
    if (isProcessing || barcode === lastScanned) return;

    setIsProcessing(true);
    setLastScanned(barcode);

    try {
      const response = await fetch(`/api/products/barcode/${barcode}`);
      const result = await response.json();

      if (result.success && result.data) {
        // Delegate logic and validation to the store
        const wasAdded = addItem({...result.data,stock_quantity:result.data.max_quantity});

        if (wasAdded) {
          playSuccessSound();
          toast.success(`Added ${result.data.name}`, {
            description: `${Number(result.data.price).toLocaleString()} FRW`,
            icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          });
        } else {
         toast.error("Stock Limit Reached", {
          description: `Only ${result.data.max_quantity} units available for ${result.data.name}.`,
        });
          // Store already showed the toast, we just play the sound
          playErrorSound();
        }

        setTimeout(() => {
          setIsProcessing(false);
          setLastScanned(null);
        }, 1200);

      } else {
        playErrorSound();
        toast.error("Product not found", {
          description: `Barcode: ${barcode}`,
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        });
        setTimeout(() => {
          setIsProcessing(false);
          setLastScanned(null);
        }, 1000);
      }
    } catch (error) {
      playErrorSound();
      toast.error("Scanner Error");
      setIsProcessing(false);
      setLastScanned(null);
    }
  };

  useEffect(() => {
    if (isOpen && type === 'scanner') {
      scanSound?.load();
      errorSound?.load();
    }
  }, [isOpen, type, scanSound, errorSound]);

  if (isOpen && type === 'scanner') {
    return (
      <Dialog open={isOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white p-0 overflow-hidden rounded-none">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
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
            
            {isProcessing && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10 backdrop-blur-[2px]">
                <div className="bg-white rounded-none p-3 shadow-2xl scale-110 transition-transform">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>
            )}

            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                <div className="w-full h-full border-2 border-blue-500/50 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_15px_red] animate-pulse" />
                </div>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-2 bg-slate-900">
            <div className="flex justify-between items-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Scanning Active</p>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={closeModal}
                  className="rounded-none text-[10px] font-bold uppercase tracking-widest h-8"
                >
                  Done
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return null;
}