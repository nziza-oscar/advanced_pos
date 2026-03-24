// app/admin/page.tsx
import { Tenant, User, Transaction, Product } from '@/lib/database/models';
import { Op } from 'sequelize';
import { 
  Users, 
  Building2, 
  Package, 
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  // Fetch real-time data
  const [totalTenants, activeTenants, totalUsers, totalProducts, recentTransactions, recentTenants] = await Promise.all([
    Tenant.count(),
    Tenant.count({ where: { status: 'active' } }),
    User.count({ where: { role: { [Op.ne]: 'super_admin' } } }),
    Product.count(),
    Transaction.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'cashier', attributes: ['full_name', 'email'] },
        { model: Tenant, as: 'tenant', attributes: ['name', 'slug'] }
      ]
    }),
    Tenant.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'name', 'slug', 'plan', 'status', 'created_at']
    })
  ]);
  
  const stats = [
    {
      title: 'Total Tenants',
      value: totalTenants,
      icon: Building2,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Tenants',
      value: activeTenants,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'bg-orange-500',
      change: '+23%',
      changeType: 'positive'
    }
  ];
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          Manage all tenants, users, and system settings
        </p>
      </div>
      
      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-500 text-xs md:text-sm font-medium">{stat.title}</p>
                <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stat.value}</p>
                <div className="flex items-center mt-1 md:mt-2">
                  <span className={`text-xs md:text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  } flex items-center`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-0.5" />
                    )}
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`${stat.color} p-2 md:p-3 rounded-full flex-shrink-0`}>
                <stat.icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Two Column Layout - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
            {recentTransactions.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {recentTransactions.map((transaction: any) => (
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
        
        {/* Recent Tenants */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 md:p-6 border-b">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Recent Tenants</h2>
              <Link 
                href="/admin/tenants" 
                className="text-xs md:text-sm text-blue-600 hover:text-blue-800"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="hidden sm:table-cell px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTenants.map((tenant: any) => (
                      <tr key={tenant.id} className="hover:bg-gray-50">
                        <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                            <div className="text-xs text-gray-500">/{tenant.slug}</div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            tenant.plan === 'enterprise' 
                              ? 'bg-purple-100 text-purple-800'
                              : tenant.plan === 'professional'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {tenant.plan}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            tenant.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : tenant.status === 'trial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {tenant.status}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-xs md:text-sm">
                          <Link
                            href={`/admin/tenants/${tenant.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-2 md:mr-3"
                          >
                            View
                          </Link>
                          <Link
                            href={`/${tenant.slug}/dashboard`}
                            className="text-green-600 hover:text-green-900"
                            target="_blank"
                          >
                            Impersonate
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for CheckCircle (since it was missing)
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}