'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Printer, 
  Eye, 
  Receipt,
  TrendingUp,
  X,
  User,
  Smartphone,
  CreditCard,
  Clock,
  FileText,
  CheckCircle,
  Hash
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CashierSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Date Range State
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const fetchMySales = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      
      const res = await fetch(`/api/transactions?${queryParams}`); 
      const result = await res.json();
      if (result.success) {
        setSales(result.data);
      }
    } catch (error) {
      console.error("Failed to load sales history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySales();
  }, [dateRange]);

  const handleViewDetails = (sale: any) => {
    setSelectedSale(sale);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSale(null);
  };

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => 
      sale.transaction_number?.toLowerCase().includes(search.toLowerCase()) ||
      sale.customer_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [sales, search]);

  const stats = useMemo(() => {
    const total = filteredSales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);
    const count = filteredSales.length;
    const average = count > 0 ? total / count : 0;
    return { total, count, average };
  }, [filteredSales]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const resetDates = () => {
    const today = new Date().toISOString().split('T')[0];
    setDateRange({ start: today, end: today });
  };

  return (
    <div className="space-y-6">
      {/* Modal for Sale Details */}
      {showModal && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Transaction Details</h2>
                <p className="text-sm text-slate-500">{selectedSale.transaction_number}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeModal}
                className="rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Transaction ID:</span>
                    <span className="font-medium">{selectedSale.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Date & Time:</span>
                    <span className="font-medium">
                      {new Date(selectedSale.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-slate-600">Status:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {selectedSale.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Customer:</span>
                    <span className="font-medium">
                      {selectedSale.customer_name || "Walk-in Customer"}
                    </span>
                  </div>
                  {selectedSale.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">Phone:</span>
                      <span className="font-medium">{selectedSale.customer_phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Payment:</span>
                    <Badge className="capitalize">
                      {selectedSale.payment_method}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Items Purchased
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Product</th>
                        <th className="text-left p-3 text-sm font-medium">Price</th>
                        <th className="text-left p-3 text-sm font-medium">Qty</th>
                        <th className="text-left p-3 text-sm font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items.map((item: any) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {item.product.image_url && (
                                <img 
                                  src={item.product.image_url} 
                                  alt={item.product.name}
                                  className="w-10 h-10 rounded-md object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-slate-500">{item.product.barcode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">{Number(item.unit_price).toLocaleString()} FRW</td>
                          <td className="p-3">{item.quantity}</td>
                          <td className="p-3 font-medium">
                            {Number(item.total_price).toLocaleString()} FRW
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="border-t pt-6">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span>{Number(selectedSale.subtotal).toLocaleString()} FRW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax:</span>
                    <span>{Number(selectedSale.tax_amount).toLocaleString()} FRW</span>
                  </div>
                  {Number(selectedSale.discount_amount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{Number(selectedSale.discount_amount).toLocaleString()} FRW</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{Number(selectedSale.total_amount).toLocaleString()} FRW</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 pt-2">
                    <span>Paid:</span>
                    <span>{Number(selectedSale.amount_paid).toLocaleString()} FRW</span>
                  </div>
                  {Number(selectedSale.change_amount) > 0 && (
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Change:</span>
                      <span>{Number(selectedSale.change_amount).toLocaleString()} FRW</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cashier Info */}
              {selectedSale.cashier && (
                <div className="border-t pt-4">
                  <p className="text-sm text-slate-500">
                    Processed by <span className="font-medium">{selectedSale.cashier.full_name}</span> ({selectedSale.cashier.username})
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedSale.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Notes:</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    {selectedSale.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex justify-end gap-3">
              <Button variant="outline" className='bg-rose-600' onClick={closeModal}>
                Close
              </Button>
             
            </div>
          </div>
        </div>
      )}

      {/* Existing JSX remains the same below... */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">My Sales History</h1>
            <p className="text-sm text-slate-500">Viewing sales from {dateRange.start} to {dateRange.end}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 px-2 ">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateChange}
                  className="text-sm border-none focus:ring-0 cursor-pointer"
                />
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-2 px-2">
                <input 
                  type="date" 
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateChange}
                  className="text-sm border-none focus:ring-0 cursor-pointer"
                />
              </div>
              { (dateRange.start !== new Date().toISOString().split('T')[0]) && (
                <Button variant="ghost" size="icon" onClick={resetDates} className="h-8 w-8">
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Button onClick={fetchMySales} className="rounded-xl">
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Revenue Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl border border-blue-500 shadow-md group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="w-32 h-32 text-white" />
            </div>
            <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">Total Revenue</p>
            <div className="flex items-end justify-between mt-4 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-white">
                  {stats.total.toLocaleString()}
                </h3>
                <p className="text-xs font-medium text-blue-200 mt-1">FRW Total Collected</p>
              </div>
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Sales Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-md group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Receipt className="w-32 h-32 text-white" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Sales</p>
            <div className="flex items-end justify-between mt-4 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-white">
                  {stats.count}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Processed Transactions</p>
              </div>
              <div className="p-3 bg-slate-700 rounded-xl border border-slate-600">
                <Receipt className="w-6 h-6 text-slate-300" />
              </div>
            </div>
          </div>

          {/* Average Basket Card */}
          <div className="relative overflow-hidden bg-primary p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-blue-200 transition-colors">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="w-32 h-32 text-slate-900" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average Basket</p>
            <div className="flex items-end justify-between mt-4 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-slate-300">
                  {Math.round(stats.average).toLocaleString()}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">FRW Per Transaction</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[1.5rem] border border-slate-400 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search Transaction Number or Customer..." 
                className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-400">
                  <TableHead className="w-[180px] text-xs uppercase tracking-wider">Ref Number</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Date & Time</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Method</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-right">Amount</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-slate-400">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-.3s]" />
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-.5s]" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <Receipt className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                      <p className="text-slate-400 italic">No transactions found for this period</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale: any) => (
                    <TableRow key={sale.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        {sale.transaction_number || `#${sale.id.slice(-6).toUpperCase()}`}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(sale.created_at).toLocaleDateString()} - {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-lg font-normal bg-slate-100 text-slate-600 border-none capitalize">
                          {sale.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-800">
                        {Number(sale.total_amount).toLocaleString()} FRW
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-xs text-slate-600">Completed</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-slate-400 hover:text-blue-600"
                            onClick={() => handleViewDetails(sale)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}