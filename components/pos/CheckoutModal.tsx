'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/lib/store/cart-store';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cart = useCartStore();
  const [loading, setLoading] = useState(false);
  
  // Local states for the form
  const [customerName, setCustomerName] = useState('');
  const [momoPhone, setMomoPhone] = useState('');

  // Reset local state when modal opens
  useEffect(() => {
    if (open) {
      setCustomerName(cart.customerName);
      setMomoPhone(cart.momoPhone);
    }
  }, [open, cart.customerName, cart.momoPhone]);

  const handleCheckout = async () => {
    if (cart.items.length === 0) return toast.error("Cart is empty");
    
    setLoading(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            product_id: item.product_id,
            product_name: item.name,
            barcode: item.barcode,
            quantity: item.quantity,
            unit_price: item.price
          })),
          subtotal: cart.subtotal,
          tax_amount: cart.taxAmount,
          discount_amount: cart.discountAmount,
          total_amount: cart.totalAmount,
          amount_paid: cart.totalAmount, 
          payment_method: cart.paymentMethod,
          momo_phone: cart.paymentMethod === 'momo' ? momoPhone : null,
          customer_name: customerName || 'Walk-in Customer'
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Sale completed successfully!');
        cart.clearCart(); // Wipes store and persistence
        onClose();
      } else {
        toast.error(result.error || "Checkout failed");
      }
    } catch (error) {
      toast.error("Network error during checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Finalize Transaction</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total to Pay:</span>
              <span className="font-bold text-lg text-blue-600">
                {Number(cart.totalAmount).toLocaleString()} FRW
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Optional"
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Payment Method</Label>
            <div className="flex gap-2">
              {['cash', 'momo'].map((method) => (
                <Button
                  key={method}
                  type="button"
                  variant={cart.paymentMethod === method ? 'default' : 'outline'}
                  className="flex-1 capitalize"
                  onClick={() => cart.setPaymentMethod(method as any)}
                >
                  {method}
                </Button>
              ))}
            </div>
          </div>
          
          {cart.paymentMethod === 'momo' && (
            <div className="grid gap-2 animate-in slide-in-from-top-2">
              <Label htmlFor="momo">MOMO Phone Number</Label>
              <Input
                id="momo"
                value={momoPhone}
                onChange={(e) => setMomoPhone(e.target.value)}
                placeholder="078... / 079..."
              />
            </div>
          )}
          
          <Button 
            onClick={handleCheckout} 
            className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700"
            disabled={loading || cart.items.length === 0}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
            Confirm & Pay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}