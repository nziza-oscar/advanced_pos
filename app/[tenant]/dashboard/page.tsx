// app/[tenant]/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  useDashboard, 
  useIsLoading, 
  useTenantActions,
  useCartTotal
} from '@/lib/store/tenantSelectors';
import { useTenant } from '@/app/contexts/TenantContext';

export default function DashboardPage() {
  const router = useRouter();
  const tenant = useTenant();
  const dashboard = useDashboard();
  const isLoading = useIsLoading();
  const { fetchDashboard } = useTenantActions();
  const { total: cartTotal } = useCartTotal();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading && !dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load dashboard data</p>
          <button
            onClick={() => fetchDashboard()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate average order value
  const avgOrderValue = dashboard.todayTransactions > 0 
    ? dashboard.todaySales / dashboard.todayTransactions 
    : 0;

  // Calculate trend (mock for now, can be enhanced with real data)
  const todayTrend = dashboard.todaySales > dashboard.weekSales / 7 ? 'up' : 'down';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={`${dashboard.todaySales.toLocaleString()} RWF`}
          subtitle={`${dashboard.todayTransactions} transactions`}
          icon={DollarSign}
          trend={todayTrend}
          trendValue={todayTrend === 'up' ? '+12%' : '-5%'}
          color="blue"
        />
        
        <StatCard
          title="Avg Order Value"
          value={`${Math.round(avgOrderValue).toLocaleString()} RWF`}
          subtitle="per transaction"
          icon={ShoppingCart}
          color="green"
        />
        
        <StatCard
          title="Total Products"
          value={dashboard.totalProducts.toString()}
          subtitle="active products"
          icon={Package}
          color="purple"
        />
        
        <StatCard
          title="Low Stock Alert"
          value={dashboard.lowStockCount.toString()}
          subtitle="products need attention"
          icon={AlertCircle}
          color="orange"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="This Week"
          amount={dashboard.weekSales}
          transactions={Math.round(dashboard.weekSales / (dashboard.todaySales || 1))}
          icon={TrendingUp}
        />
        <SummaryCard
          title="This Month"
          amount={dashboard.monthSales}
          transactions={Math.round(dashboard.monthSales / (dashboard.todaySales || 1))}
          icon={Calendar}
        />
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Your Plan</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
              tenant.plan === 'enterprise' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
              tenant.plan === 'professional' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
              tenant.plan === 'basic' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {tenant.plan}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground capitalize">{tenant.plan}</p>
          {tenant.plan === 'trial' && (
            <Link 
              href={`/${tenant.slug}/billing`}
              className="inline-block mt-3 text-sm text-primary hover:underline"
            >
              Upgrade plan →
            </Link>
          )}
        </div>
      </div>

      {/* Recent Transactions & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            <Link 
              href={`/${tenant.slug}/transactions`}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {dashboard.recentTransactions.length === 0 ? (
              <div className="px-6 py-8 text-center text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              dashboard.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">{transaction.transaction_number}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                        {transaction.cashier && (
                          <span className="text-xs text-muted-foreground">
                            • {transaction.cashier.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {transaction.total_amount.toLocaleString()} RWF
                      </p>
                      <p className="text-xs text-muted-foreground capitalize mt-1">
                        {transaction.payment_method}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Top Products</h2>
            <Link 
              href={`/${tenant.slug}/products`}
              className="text-sm text-primary hover:underline"
            >
              View all products
            </Link>
          </div>
          <div className="divide-y divide-border">
            {dashboard.topProducts.length === 0 ? (
              <div className="px-6 py-8 text-center text-muted-foreground">
                No sales data yet
              </div>
            ) : (
              dashboard.topProducts.map((product, index) => (
                <div key={index} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {product.quantity} units sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {product.revenue.toLocaleString()} RWF
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">revenue</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="Start New Sale"
          description="Process a new transaction"
          icon={ShoppingCart}
          href={`/${tenant.slug}/pos`}
          color="blue"
        />
        <QuickActionCard
          title="Add Product"
          description="Add new product to inventory"
          icon={Package}
          href={`/${tenant.slug}/products/create`}
          color="green"
        />
        <QuickActionCard
          title="View Reports"
          description="Analyze business performance"
          icon={TrendingUp}
          href={`/${tenant.slug}/reports`}
          color="purple"
        />
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  color 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: any; 
  trend?: 'up' | 'down'; 
  trendValue?: string; 
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600',
    orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600',
  };
  
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-3">
          {trend === 'up' ? (
            <ArrowUp className="h-3 w-3 text-green-600" />
          ) : (
            <ArrowDown className="h-3 w-3 text-red-600" />
          )}
          <span className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trendValue}
          </span>
          <span className="text-xs text-muted-foreground">vs last week</span>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, amount, transactions, icon: Icon }: { title: string; amount: number; transactions: number; icon: any }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-xl font-bold text-foreground">{amount.toLocaleString()} RWF</p>
      <p className="text-xs text-muted-foreground mt-1">{transactions} transactions</p>
    </div>
  );
}

function QuickActionCard({ title, description, icon: Icon, href, color }: { title: string; description: string; icon: any; href: string; color: string }) {
  const colorClasses = {
    blue: 'hover:border-blue-300 dark:hover:border-blue-700',
    green: 'hover:border-green-300 dark:hover:border-green-700',
    purple: 'hover:border-purple-300 dark:hover:border-purple-700',
  };
  
  return (
    <Link
      href={href}
      className={`bg-card border border-border rounded-lg p-4 transition-all hover:shadow-md ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-950/30`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}