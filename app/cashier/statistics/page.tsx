'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Tag, CreditCard, Smartphone, Banknote, RefreshCcw, LayoutDashboard } from 'lucide-react';
import { SalesBarChart } from '@/components/charts/SalesBarChart';

export default function CashierStatisticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cashier/statistics');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-blue-50/20">
        <RefreshCcw className="w-8 h-8 text-blue-400 animate-spin stroke-[1.5]" />
      </div>
    );
  }

  const { summary, payments, hourly } = data;

  const metrics = [
    { label: 'Total Revenue', value: summary.revenue.toLocaleString(), icon: DollarSign },
    { label: 'Orders Made', value: summary.transactions, icon: ShoppingCart },
    { label: 'Units Sold', value: summary.itemsSold, icon: TrendingUp },
    { label: 'Discounts', value: summary.discounts.toLocaleString(), icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-primary tracking-tight">Shift Performance</h1>
            <p className="text-gray-700 font-medium text-sm mt-1">Real-time usage overview</p>
          </div>
          <button onClick={fetchData} className="p-3 text-blue-400 bg-white border border-blue-50 rounded-2xl hover:bg-blue-50 transition-all">
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m) => (
            <div key={m.label} className="bg-white p-6 rounded-xl border border-primary shadow-sm">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                <m.icon className="w-5 h-5 stroke-[1.5]" />
              </div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{m.label}</p>
              <p className="text-2xl font-bold text-blue-600">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SalesBarChart data={hourly} />
          </div>

          {/* Soft Blue Breakdown Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-blue-50/50 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <LayoutDashboard className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-blue-600">Drawer Balance</h3>
              </div>
              
              <BreakdownRow icon={Banknote} label="Cash" value={payments.cash} color="text-emerald-500" bg="bg-emerald-50" />
              <BreakdownRow icon={Smartphone} label="MoMo" value={payments.momo} color="text-blue-500" bg="bg-blue-50" />
              <BreakdownRow icon={CreditCard} label="Card" value={payments.card} color="text-indigo-500" bg="bg-indigo-50" />
            </div>

            <div className="mt-10 bg-blue-600 p-6 rounded-xl text-white">
              <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1 opacity-80">Total Collected</p>
              <p className="text-3xl font-bold">{summary.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 ${bg} ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-4 h-4 stroke-[1.5]" />
        </div>
        <span className="font-medium text-slate-500 text-sm">{label}</span>
      </div>
      <span className="font-bold text-blue-600">{value.toLocaleString()}</span>
    </div>
  );
}