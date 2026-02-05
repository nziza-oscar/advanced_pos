'use client';

import React, { useEffect, useState } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Boxes,
  History,
  RefreshCw,
  PlusCircle,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Upload,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { useModalStore } from '@/lib/store/modal-store';
import { AddProductModal } from '@/components/products/AddProductModal';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/store';
import Titles from '@/components/layout/Titles';

export default function InventoryManagerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  // Get modal store functions
  const { openModal, type, isOpen } = useModalStore();
  const { openModal:openCategoryModal} = useUIStore()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/inventory-manager/statistics'),
          fetch('/api/inventory-manager/recent-activity')
        ]);
        
        const statsJson = await statsRes.json();
        const activityJson = await activityRes.json();
        
        if (statsJson.success) setData(statsJson.data);
        if (activityJson.success) setRecentActivity(activityJson.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    window.location.reload();
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch('/api/inventory-manager/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl" />
          <div className="h-4 w-24 bg-blue-50 rounded" />
        </div>
      </div>
    );
  }

  const inventoryMetrics = [
    { 
      label: 'Total Products', 
      value: data.totalProducts.toLocaleString(), 
      icon: Package, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100',
      border: 'border-blue-200',
      change: '+5.2%',
      changeType: 'increase'
    },
    { 
      label: 'Low Stock Items', 
      value: data.lowStockCount, 
      icon: AlertTriangle, 
      color: 'text-amber-600', 
      bg: 'bg-amber-100',
      border: 'border-amber-200',
      change: data.lowStockChange > 0 ? `+${data.lowStockChange}` : `${data.lowStockChange}`,
      changeType: data.lowStockChange > 0 ? 'increase' : 'decrease'
    },
    { 
      label: 'Out of Stock', 
      value: data.outOfStockCount, 
      icon: Boxes, 
      color: 'text-rose-600', 
      bg: 'bg-rose-100',
      border: 'border-rose-200',
      change: data.outOfStockChange > 0 ? `+${data.outOfStockChange}` : `${data.outOfStockChange}`,
      changeType: data.outOfStockChange > 0 ? 'increase' : 'decrease'
    },
    { 
      label: 'Stock Value', 
      // Updated to FRW
      value: `${data.totalStockValue.toLocaleString()} FRW`,
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100',
      border: 'border-emerald-200',
      change: '+12.5%',
      changeType: 'increase'
    },
    { 
      label: 'Categories', 
      value: data.categoryCount, 
      icon: Boxes, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-100',
      border: 'border-indigo-200',
      change: '+2',
      changeType: 'increase'
    },
    { 
      label: 'Monthly Movements', 
      value: data.monthlyMovements.toLocaleString(), 
      icon: RefreshCw, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100',
      border: 'border-purple-200',
      change: '+8.3%',
      changeType: 'increase'
    },
  ];
  const quickActions = [
    { 
      title: 'Add Product', 
      icon: PlusCircle, 
      color: 'bg-blue-500 hover:bg-blue-600',
      href: null,
      onClick: () => openModal('add-product')
    },
    
    { 
      title: 'View Reports', 
      icon: BarChart3, 
      color: 'bg-purple-500 hover:bg-purple-600',
      href: '/inventory-manager/reports'
    },

  ];

  return (
    <>
      <div className="space-y-10 pb-10">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         
          <Titles title='Inventory Overview' description='Monitor stock levels, track movements, and manage inventory.'/>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <Button
              onClick={() => openModal('add-product')}
            >
               Add Product
            </Button>
            <Button onClick={() => openCategoryModal('add-category')} >
              Add Category
            </Button>
            
          </div>
        </div>

      

        {/* Inventory Metrics - Read-only display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {inventoryMetrics.map((metric:any) => (
    <div
      key={metric.label}
      // Using rounded-xl and more saturated background colors
      className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${metric.bg} ${metric.border}`}
    >
      
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center">
          <metric.icon className={`w-5 h-5 stroke-[2.5] ${metric.color}`} />
        </div>
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-800/70 uppercase tracking-widest mb-1">
          {metric.label}
        </p>
        <h4 className="text-xl font-black text-slate-900 tracking-tight">
          {/* Displaying value in FRW */}
          {metric.isCurrency ? `${metric.value.toLocaleString()} FRW` : metric.value}
        </h4>
      </div>
 
    </div>
  ))}

{quickActions.map((action) => (
            action.href ? (
              <Link
                key={action.title}
                href={action.href}
                className={`${action.color} p-6 rounded-2xl text-white transition-all hover:shadow-lg hover:scale-[1.02]`}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <action.icon className="w-8 h-8" />
                  <span className="font-bold text-sm">{action.title}</span>
                </div>
              </Link>
            ) : (
              <button
                key={action.title}
                onClick={action.onClick}
                className={`${action.color} p-6 rounded-2xl text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95`}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <action.icon className="w-8 h-8" />
                  <span className="font-bold text-sm">{action.title}</span>
                </div>
              </button>
            )
          ))}
</div>
 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Stock Movements */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Recent Stock Movements</h3>
                  <p className="text-sm text-slate-400">Last 24 hours stock changes</p>
                </div>
              </div>
              <Link 
                href="/inventory-manager/activity" 
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>

            <div className="space-y-6">
              {recentActivity.map((log, i) => (
                <Link
                  key={i}
                  href={`/inventory-manager/transactions/${log.transactionId}`}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors block"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${log.type === 'in' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                      {log.type === 'in' ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-slate-700">{log.product}</p>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-slate-400" />
                        <p className="text-xs text-slate-400">By {log.user}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold ${log.type === 'in' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {log.type === 'in' ? '+' : ''}{log.quantity}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{log.time}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Low Stock Alerts</h3>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                {data.lowStockAlerts?.length || 0} items
              </span>
            </div>

            <div className="space-y-4">
              {data.lowStockAlerts?.slice(0, 5).map((alert: any, i: number) => (
                <Link
                  key={i}
                  href={`/inventory_manager/products/${alert.id}/restock`}
                  className="block p-4 bg-amber-50 rounded-2xl border border-amber-100 text-left hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-slate-800">{alert.name}</p>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                      {alert.stock} left
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Min: {alert.minStock}</span>
                    <span className="font-medium text-amber-600 hover:text-amber-700">
                      Restock →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {data.lowStockAlerts?.length > 5 && (
              <Link 
                href="/inventory-manager/alerts"
                className="block w-full mt-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors text-center"
              >
                View All ({data.lowStockAlerts.length}) Alerts
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isOpen && type === 'add-product' && (
        <AddProductModal />
      )}
    </>
  );
}