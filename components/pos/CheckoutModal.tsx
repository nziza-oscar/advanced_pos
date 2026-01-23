'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CheckoutModal({ product, onClose }: { product: any; onClose: () => void }) {
  const [price, setPrice] = useState(product.price);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [momoPhone, setMomoPhone] = useState('');
  
  const handleCheckout = async () => {
    // Process checkout here
    alert('Sale completed!');
    onClose();
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Checkout: {product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Barcode</Label>
            <Input value={product.barcode} readOnly />
          </div>
          
          <div>
            <Label>Selling Price</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          
          <div>
            <Label>Customer Name</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Optional"
            />
          </div>
          
          <div>
            <Label>Payment Method</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('cash')}
              >
                Cash
              </Button>
              <Button
                type="button"
                variant={paymentMethod === 'momo' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('momo')}
              >
                MOMO
              </Button>
            </div>
          </div>
          
          {paymentMethod === 'momo' && (
            <div>
              <Label>MOMO Phone Number</Label>
              <Input
                value={momoPhone}
                onChange={(e) => setMomoPhone(e.target.value)}
                placeholder="05X XXX XXXX"
              />
            </div>
          )}
          
          <Button onClick={handleCheckout} className="w-full">
            Complete Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}