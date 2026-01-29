'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Printer, Calendar, User, Phone, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TransactionDetailModal({ 
  transaction, 
  open, 
  onClose 
}: { 
  transaction: any; 
  open: boolean; 
  onClose: () => void 
}) {
  if (!transaction) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">
            Transaction Details
          </DialogTitle>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="mr-6">
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Transaction ID</p>
              <p className="font-mono text-sm">{transaction.transaction_number}</p>
            </div>
            <div className="space-y-2 text-right">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status</p>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase">
                {transaction.status}
              </Badge>
            </div>
          </div>

          {/* Customer & Cashier Info */}
          <div className="grid grid-cols-2 gap-8 px-1">
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" /> Customer Info
              </h4>
              <div className="text-sm space-y-1">
                <p><span className="text-slate-500">Name:</span> {transaction.customer_name || 'Walk-in'}</p>
                {transaction.momo_phone && (
                  <p className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> 
                    {transaction.momo_phone}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-500" /> Payment & Staff
              </h4>
              <div className="text-sm space-y-1">
                <p><span className="text-slate-500">Method:</span> <span className="uppercase font-medium">{transaction.payment_method}</span></p>
                <p><span className="text-slate-500">Cashier:</span> {transaction.cashier?.full_name || 'Unknown'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Items Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-tight text-slate-700">Purchased Items</h4>
            <div className="border rounded-md">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item?.product?.name}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{Number(item.unit_price).toLocaleString()} FRW</TableCell>
                      <TableCell className="text-right font-bold">{Number(item.total_price).toLocaleString()} FRW</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal:</span>
                <span>{Number(transaction.subtotal).toLocaleString()} FRW</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax:</span>
                <span>{Number(transaction.tax_amount).toLocaleString()} FRW</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg text-blue-600">
                <span>Grand Total:</span>
                <span>{Number(transaction.total_amount).toLocaleString()} FRW</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}