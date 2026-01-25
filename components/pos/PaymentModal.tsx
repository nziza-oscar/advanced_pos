'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useModalStore } from '@/lib/store/modal-store';
import { useCartStore, useCartSummary } from '@/lib/store/cart-store';
import { toast } from 'sonner';
import { CreditCard, Smartphone, Banknote } from 'lucide-react';

export function PaymentModal() {
  const { isOpen, type, closeModal } = useModalStore();
  const { items, clearCart } = useCartStore();
  const { totalAmount } = useCartSummary();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'momo'>('cash');
  const [momoPhone, setMomoPhone] = useState('');
  const [amountPaid, setAmountPaid] = useState(totalAmount.toString());
  const [customerName, setCustomerName] = useState('');

  const isOpenModal = isOpen && type === 'payment';

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    const change = paid - totalAmount;
    return change >= 0 ? Math.round(change).toLocaleString() : '0';
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);

    try {
      const transactionData = {
        customer_name: customerName || 'Walk-in Customer',
        items: items.map(item => ({
          product_id: item.product_id,
          barcode: item.barcode,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          discount_amount: 0,
        })),
        subtotal: totalAmount,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: totalAmount,
        amount_paid: parseFloat(amountPaid),
        payment_method: paymentMethod,
        momo_phone: paymentMethod === 'momo' ? momoPhone : null,
      };

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment processed successfully!');
        clearCart();
        closeModal();
      } else {
        toast.error(data.error || 'Payment failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpenModal) return null;

  return (
    <Dialog open={isOpenModal} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total Amount */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Total Amount:</span>
              <span className="text-3xl font-black text-orange-400">
                {Math.round(totalAmount).toLocaleString()} FRW
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest">
              {items.length} item{items.length !== 1 ? 's' : ''} in cart
            </p>
          </div>

          {/* Customer Name */}
          <div className="space-y-1.5">
            <Label htmlFor="customerName" className="text-xs font-bold uppercase text-slate-500">Customer Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in Customer"
              className="rounded-xl"
              disabled={loading}
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500">Payment Method</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 h-14 rounded-xl transition-all ${paymentMethod === 'cash' ? 'bg-slate-900 shadow-lg scale-[1.02]' : ''}`}
                disabled={loading}
              >
                <Banknote className="w-5 h-5 mr-2" />
                CASH
              </Button>
              <Button
                type="button"
                variant={paymentMethod === 'momo' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('momo')}
                className={`flex-1 h-14 rounded-xl transition-all ${paymentMethod === 'momo' ? 'bg-[#FFCC00] hover:bg-[#E6B800] text-black border-none shadow-lg scale-[1.02]' : ''}`}
                disabled={loading}
              >
                <Smartphone className="w-5 h-5 mr-2" />
                MOMO
              </Button>
            </div>
          </div>

          {/* MOMO Phone Input */}
          {paymentMethod === 'momo' && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="momoPhone" className="text-xs font-bold uppercase text-slate-500">MOMO Phone Number</Label>
              <Input
                id="momoPhone"
                value={momoPhone}
                onChange={(e) => setMomoPhone(e.target.value)}
                placeholder="078 XXX XXXX"
                className="rounded-xl border-orange-200 focus-visible:ring-orange-400"
                disabled={loading}
              />
            </div>
          )}

          {/* Amount Paid */}
          <div className="space-y-1.5">
            <Label htmlFor="amountPaid" className="text-xs font-bold uppercase text-slate-500">Amount Received (FRW)</Label>
            <Input
              id="amountPaid"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0"
              className="rounded-xl text-lg font-bold"
              disabled={loading}
            />
          </div>

          {/* Change */}
          {paymentMethod === 'cash' && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-emerald-700 font-bold text-sm uppercase tracking-tight">Balance to Return:</span>
                <span className="text-xl font-black text-emerald-600">
                  {calculateChange()} FRW
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              className="flex-1 rounded-xl font-bold"
              disabled={loading}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-[2] rounded-xl h-12 bg-slate-900 font-black uppercase tracking-tighter"
              disabled={loading || items.length === 0}
            >
              {loading ? 'Processing...' : 'Complete Transaction'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}