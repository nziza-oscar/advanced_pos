// app/admin/page.tsx
'use client';

import { useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Package, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';
import { useStats, useIsLoading, useAdminActions } from '@/lib/store/adminSelectors';

export default function AdminDashboard() {
  const stats = useStats();
  const isLoading = useIsLoading();
  const { fetchStats, fetchTenants, fetchTransactions } = useAdminActions();

  useEffect(() => {
    fetchStats();
    fetchTenants();
    fetchTransactions();
  }, [fetchStats, fetchTenants, fetchTransactions]);

  const statsCards = [
    {
      title: 'Total Tenants',
      value: stats?.totalTenants ?? 0,
      icon: Building2,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Tenants',
      value: stats?.activeTenants ?? 0,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: 'bg-orange-500'
    }
  ];

  const recentTransactions = stats?.recentTransactions ?? [];
  const hasTransactions = recentTransactions.length > 0;

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          Manage all tenants, users, and system settings
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {statsCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-500 text-xs md:text-sm font-medium">{stat.title}</p>
                <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 md:p-3 rounded-full flex-shrink-0`}>
                <stat.icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 md:p-6 border-b">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <Link 
              href="/admin/transactions" 
              className="text-xs md:text-sm text-blue-600 hover:text-blue-800"
            >
              View All →
            </Link>
          </div>
        </div>
        <div className="p-4 md:p-6">
          {hasTransactions ? (
            <div className="space-y-3 md:space-y-4">
              {recentTransactions.map((transaction:any) => (
                <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 md:pb-4 last:border-0 gap-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      ${parseFloat(transaction.total_amount).toFixed(2)}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      {transaction.transaction_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {transaction.tenant?.name} • {transaction.cashier?.full_name}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 text-sm">No recent transactions</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}