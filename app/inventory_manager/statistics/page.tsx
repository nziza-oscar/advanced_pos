'use client';

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  FileSpreadsheet,
  CreditCard,
  BookA
} from 'lucide-react';
import { toast } from 'sonner';
import { SalesBar } from '@/components/charts/SalesBar';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { Button } from '@/components/ui/button';
import Titles from '@/components/layout/Titles';
import { DateRange } from 'react-day-picker';

interface AdminStats {
  summary: {
    revenue: number;
    transactions: number;
    avgOrderValue: number;
    activeStaff: number;
    revenueChange: number;
    transactionChange: number;
    avgOrderChange: number;
  };
  hourly: any[];
  categories: Array<{
    name: string;
    revenue: number;
    percentage: number;
    change: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    percentage: number;
    revenue: number;
  }>;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
    category: string;
  }>;
  dailyData: Array<{
    date: string;
    revenue: number;
    transactions: number;
    avgOrder: number;
  }>;
}

const formatCurrency = (amount: number) => {
  return `FRW ${Number(amount).toLocaleString('en-RW')}`;
};

const formatNumber = (num: number) => {
  return num.toLocaleString('en-RW');
};

export default function AdminStatisticsPage() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  const fetchData = async (range?: DateRange) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (range?.from) {
        params.append('startDate', range.from.toISOString().split('T')[0]);
        const endDate = range.to || range.from;
        params.append('endDate', endDate.toISOString().split('T')[0]);
      }
      
      const res = await fetch(`/api/admin/statistics?${params.toString()}`);
      const json = await res.json();
      
      if (json.success) {
        setData(json.data);
      } else {
        toast.error(json.error || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(dateRange); 
  }, []);

  const handleRefresh = () => {
    fetchData(dateRange);
  };

  const handleExport = async (format: 'excel' | 'pdf' = 'excel') => {
    if (!data || !dateRange?.from) {
      toast.error("Please select a valid date range first.");
      return;
    }
    
    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.append('startDate', dateRange.from.toISOString().split('T')[0]);
      const endDate = dateRange.to || dateRange.from;
      params.append('endDate', endDate.toISOString().split('T')[0]);
      params.append('format', format);
      
      const response = await fetch(`/api/admin/statistics/export?${params.toString()}`);
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-report-${dateRange.from.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) {
      fetchData(range);
    }
  };

  const getCardBgClass = (index: number) => {
    const gradients = [
      'bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600',
      'bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600',
      'bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600',
      'bg-gradient-to-br from-rose-600 via-rose-500 to-pink-600',
    ];
    return gradients[index % gradients.length];
  };

  const getIconBgClass = (index: number) => {
    return 'bg-white/20 text-white';
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-emerald-300';
    if (trend < 0) return 'text-rose-200';
    return 'text-white/50';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight className="w-3 h-3" />;
    if (trend < 0) return <ArrowDownRight className="w-3 h-3" />;
    return null;
  };

  const formatTrend = (trend: number) => {
    if (trend > 0) return `+${trend.toFixed(1)}%`;
    if (trend < 0) return `${trend.toFixed(1)}%`;
    return '0%';
  };

  const getPaymentMethodIcon = (method: string) => {
    switch(method.toLowerCase()) {
      case 'cash': return <BookA className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'momo': return <DollarSign className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin stroke-[1.5]" />
          <p className="text-slate-400 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { summary, categories, paymentMethods, topProducts } = data;

  const adminMetrics = [
    { label: 'Total Revenue', value: formatCurrency(summary.revenue), trend: summary.revenueChange, icon: DollarSign },
    { label: 'Avg. Order Value', value: formatCurrency(summary.avgOrderValue), trend: summary.avgOrderChange, icon: TrendingUp },
    { label: 'Total Transactions', value: formatNumber(summary.transactions), trend: summary.transactionChange, icon: ShoppingBag },
    { label: 'Active Staff', value: summary.activeStaff.toString(), trend: 0, icon: Users },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Titles title='General Reports' description='Detailed performance report across all branches.'/>
        <div className="flex items-center gap-3 flex-wrap">
          <DateRangePicker dateRange={dateRange} onDateChange={handleDateChange} />
          
          <div className="relative group">
            <Button disabled={exporting}>
              {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              {exporting ? "Exporting..." : "Export"}
            </Button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button onClick={() => handleExport('excel')} className="w-full px-4 py-3 text-left hover:bg-blue-50 rounded-t-2xl flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                Export to Excel
              </button>
              <button onClick={() => handleExport('pdf')} className="w-full px-4 py-3 text-left hover:bg-blue-50 rounded-b-2xl flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileSpreadsheet className="w-4 h-4 text-rose-600" />
                Export to PDF
              </button>
            </div>
          </div>
          
          <button onClick={handleRefresh} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminMetrics.map((m, i) => (
          <div key={m.label} className={`p-7 rounded-lg border border-white/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 ${getCardBgClass(i)}`}>
            <div className={`w-12 h-12 ${getIconBgClass(i)} rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300`}>
              <m.icon className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mb-1">{m.label}</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-bold text-white">{m.value}</h4>
              {m.trend !== 0 && (
                <span className={`text-[10px] font-bold flex items-center gap-0.5 ${getTrendColor(m.trend)}`}>
                  {getTrendIcon(m.trend)}
                  {formatTrend(m.trend)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-blue-50/50 shadow-sm">
          <div className="flex items-center justify-between mb-8 px-2 pt-2">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Revenue Flow</h3>
              <p className="text-xs text-slate-400 font-medium">
                {dateRange?.from?.toLocaleDateString()} - {dateRange?.to?.toLocaleDateString() || dateRange?.from?.toLocaleDateString()}
              </p>
            </div>
          </div>
          {data.hourly && <SalesBar data={data.hourly} />}
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-blue-50/50 shadow-sm">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Top Categories</h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Revenue Share</span>
            </div>
            <div className="space-y-6">
              {categories.map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600">{formatCurrency(cat.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-1000" style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 p-5 bg-blue-50 rounded-3xl border border-blue-100/50">
            <h4 className="text-sm font-bold text-slate-700 mb-3">Payment Methods</h4>
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div key={pm.method} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(pm.method)}
                    <span className="text-sm font-medium text-slate-600">{pm.method}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{formatCurrency(pm.revenue)}</span>
                    <span className="text-xs font-bold text-blue-600 bg-white px-2 py-1 rounded-full">{pm.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-blue-50/50 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-slate-800">Top Selling Products</h3>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{topProducts.length} Products</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Rank</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Quantity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4"><div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-blue-50 text-blue-600">{index + 1}</div></td>
                  <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-700">{product.name}</span></td>
                  <td className="px-6 py-4"><span className="text-sm font-bold text-slate-800">{formatNumber(product.quantity)} Units</span></td>
                  <td className="px-6 py-4"><span className="text-sm font-bold text-slate-800">{formatCurrency(product.revenue)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}