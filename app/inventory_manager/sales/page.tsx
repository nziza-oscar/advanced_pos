'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Receipt, 
  User as UserIcon, 
  Calendar, 
  Loader2, 
  ShoppingBag,
  TrendingUp,
  Search,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import Titles from '@/components/layout/Titles';

export default function SalesHistoryPage() {
  const router = useRouter();
  const [sales, setSales] = useState<any[]>([]);
  const [range, setRange] = useState('day');
  const [methodFilter, setMethodFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSales = async (selectedRange: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/sales?range=${selectedRange}`);
      const result = await res.json();
      if (result.success) {
        setSales(result.data);
      }
    } catch (error) {
      console.error("Sales load failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(range);
  }, [range]);

  const filteredSales = sales.filter(sale => {
    const matchesMethod = methodFilter === 'all' || sale.method.toLowerCase() === methodFilter.toLowerCase();
    const matchesSearch = sale.invoice_no.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         sale.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  const formatFRW = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount).replace('RWF', 'FRW');
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'momo': return <Smartphone className="w-3 h-3" />;
      case 'card': return <CreditCard className="w-3 h-3" />;
      default: return <Banknote className="w-3 h-3" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 print:p-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 print:hidden">
        <div>
         
          <Titles title='Sales History' description='Detailed transaction logs and revenue overview.'/>
        </div>

        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {['day', 'week', 'month'].map((id) => (
            <button
              key={id}
              onClick={() => setRange(id)}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                range === id 
                ? 'bg-primary text-blue-200 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {id === 'day' ? 'Today' : `This ${id}`}
            </button>
          ))}
        </div>
      </div>

     
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 print:hidden">
        {/* Gross Revenue Card - Solid Blue */}
        <div className="bg-blue-600 p-6 rounded-xl border border-blue-700 shadow-md relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="h-10 w-10 bg-white/20 text-white rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Gross Revenue</span>
          </div>
          <h2 className="text-3xl font-bold text-white relative z-10">{formatFRW(totalRevenue)}</h2>
          <div className="absolute -right-2 -bottom-2 opacity-10 transition-transform group-hover:scale-110">
            <TrendingUp className="w-20 h-20 text-white" />
          </div>
        </div>

        {/* Total Sales Card - Solid Purple */}
        <div className="bg-purple-600 p-6 rounded-xl border border-purple-700 shadow-md relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="h-10 w-10 bg-white/20 text-white rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-purple-100 uppercase tracking-wider">Total Sales</span>
          </div>
          <h2 className="text-3xl font-bold text-white relative z-10">{filteredSales.length} Transactions</h2>
          <div className="absolute -right-2 -bottom-2 opacity-10 transition-transform group-hover:scale-110">
            <ShoppingBag className="w-20 h-20 text-white" />
          </div>
        </div>

        {/* Avg Sale Card - Solid Orange */}
        <div className="bg-orange-500 p-6 rounded-xl border border-orange-600 shadow-md relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="h-10 w-10 bg-white/20 text-white rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-orange-50 uppercase tracking-wider">Avg. Sale</span>
          </div>
          <h2 className="text-3xl font-bold text-white relative z-10">
            {filteredSales.length > 0 ? formatFRW(totalRevenue / filteredSales.length) : '0 FRW'}
          </h2>
          <div className="absolute -right-2 -bottom-2 opacity-10 transition-transform group-hover:scale-110">
            <Receipt className="w-20 h-20 text-white" />
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-10 print:border-none print:shadow-none">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoice or customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 mr-1" />
            <select 
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="momo">Momo</option>
              <option value="card">Card</option>
              <option value="bank">Bank</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredSales.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredSales.map((sale) => (
              <div key={sale.id} className="group print:break-inside-avoid">
                <div 
                  onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                  className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer print:hidden"
                >
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white transition-colors">
                      <Receipt className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{sale.invoice_no}</p>
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                          {getMethodIcon(sale.method)} {sale.method}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase mt-0.5 tracking-tight">{sale.customer}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{formatFRW(sale.total)}</p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{sale.time_ago}</span>
                      </div>
                    </div>
                    {expandedSale === sale.id ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
                  </div>
                </div>

                {(expandedSale === sale.id || (typeof window !== 'undefined' && window.matchMedia('print').matches)) && (
                  <div className="bg-slate-50/50 px-5 py-6 border-t border-slate-100 print:bg-white print:border-none print:p-0">
                    <div className="max-w-2xl ml-0 md:ml-16">
                      <div className="flex justify-between items-start mb-6 print:mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-8 bg-blue-600 rounded-full print:hidden"></div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction Breakdown</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); handlePrint(); }}
                          className="h-8 gap-2 bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 rounded-lg print:hidden"
                        >
                          <Printer className="w-3 h-3" />
                          Print Receipt
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {sale.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded bg-white border border-slate-200 overflow-hidden flex-shrink-0 print:hidden">
                                {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100" />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{item.qty} units @ {formatFRW(item.price)}</p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-600">{formatFRW(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-200 space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                          <span>Subtotal</span>
                          <span>{formatFRW(sale.subtotal)}</span>
                        </div>
                        {sale.discount > 0 && (
                          <div className="flex justify-between text-xs font-bold text-red-500 uppercase">
                            <span>Discount</span>
                            <span>-{formatFRW(sale.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs font-bold text-slate-500 pb-2 uppercase">
                          <span>Tax Amount</span>
                          <span>{formatFRW(sale.tax)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-300">
                          <span className="text-xs font-bold text-slate-900 uppercase tracking-widest text-lg">Total Amount</span>
                          <span className="text-xl font-bold text-blue-600">{formatFRW(sale.total)}</span>
                        </div>
                        <div className="pt-4 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                          <div className="flex items-center gap-4">
                            <span>Cashier: {sale.cashier}</span>
                            <span>Inv: {sale.invoice_no}</span>
                          </div>
                          <span>{moment(sale.timestamp).format('YYYY-MM-DD HH:mm:ss')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <ShoppingBag className="w-10 h-10 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest">No matching transactions.</p>
          </div>
        )}
      </div>
    </div>
  );
}