'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  CreditCard,
  ShoppingCart,
  DollarSign,
  BarChart3,
  AlertCircle,
  Clock,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  QrCode,
  Eye,
  Receipt,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Titles from '@/components/layout/Titles';

interface DashboardStats {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  transactions: {
    current: number;
    previous: number;
    change: number;
  };
  avgOrderValue: number;
  activeStaff: number;
  lowStockItems: number;
  pendingOrders: number;
  recentTransactions: Array<{
    id: string;
    transaction_number: string;
    total_amount: number;
    payment_method: string;
    created_at: string;
    status: string;
  }>;
}

// New interface for top categories
interface TopCategory {
  name: string;
  revenue: number;
  transactions: number;
  change: number;
}

interface InventoryAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock: number;
  status: 'critical' | 'low' | 'warning';
  barcode?: string;
  category?: string;
  percentage: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch all data in parallel
      const [dashboardRes, categoriesRes, alertsRes] = await Promise.all([
        fetch(`/api/admin/dashboard?range=${timeRange}`),
        fetch(`/api/categories/top?range=${timeRange}&limit=5`),
        fetch('/api/admin/inventory/alerts')
      ]);

      // Parse responses
      const dashboardData = await dashboardRes.json();
      const categoriesData = await categoriesRes.json();
      const alertsData = await alertsRes.json();
      
      // Update state with fetched data
      if (dashboardData.success) setStats(dashboardData.data);
      if (categoriesData.success) setTopCategories(categoriesData.data);
      if (alertsData.success) setInventoryAlerts(alertsData.data);
      
      // Handle errors
      if (!dashboardData.success) {
        toast.error('Failed to load dashboard data');
      }
      if (!categoriesData.success) {
        toast.error('Failed to load category data');
      }
    } catch (error) {
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchData();
    toast.info('Refreshing dashboard data...');
  };

  const quickActions = [
    {
      title: 'Generate Barcodes',
      description: 'Create new product barcodes',
      icon: QrCode,
      color: 'from-blue-500 to-blue-600',
      iconColor: 'text-blue-100',
      href: '/dashboard/barcode-gen',
      action: () => router.push('/dashboard/barcode-gen')
    },
    {
      title: 'View Reports',
      description: 'Detailed sales analytics',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      iconColor: 'text-purple-100',
      href: '/dashboard/statistics',
      action: () => router.push('/dashboard/statistics')
    },
    {
      title: 'Manage Inventory',
      description: 'Update stock & products',
      icon: Package,
      color: 'from-emerald-500 to-emerald-600',
      iconColor: 'text-emerald-100',
      href: '/dashboard/inventory',
      action: () => router.push('/dashboard/inventory')
    },
    {
      title: 'Staff Management',
      description: 'View & manage staff',
      icon: Users,
      color: 'from-amber-500 to-amber-600',
      iconColor: 'text-amber-100',
      href: '/dashboard/staff',
      action: () => router.push('/dashboard/staff')
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        
        <Titles title='Dashboard' description=' Overview of business performance and management tools' />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <Button
              variant={timeRange === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('today')}
              className="flex-1 sm:flex-none"
            >
              Today
            </Button>
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('week')}
              className="flex-1 sm:flex-none"
            >
              This Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
              className="flex-1 sm:flex-none"
            >
              This Month
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Revenue Card - Emerald Gradient */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Total Revenue</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">
              FRW {stats?.revenue.current.toLocaleString() || '0'}
            </div>
            <div className="flex items-center text-sm text-white/80 mt-2">
              {stats?.revenue.change !== undefined && (
                <>
                  {stats.revenue.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-200 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-rose-200 mr-1" />
                  )}
                  <span className={stats.revenue.change >= 0 ? 'text-emerald-100' : 'text-rose-100'}>
                    {Math.abs(stats.revenue.change)}% from previous period
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transactions Card - Blue Gradient */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Transactions</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">
              {stats?.transactions.current || 0}
            </div>
            <div className="flex items-center text-sm text-white/80 mt-2">
              {stats?.transactions.change !== undefined && (
                <>
                  {stats.transactions.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-blue-200 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-rose-200 mr-1" />
                  )}
                  <span className={stats.transactions.change >= 0 ? 'text-blue-100' : 'text-rose-100'}>
                    {Math.abs(stats.transactions.change)}% change
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Avg Order Value Card - Purple Gradient */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Avg Order Value</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">
              FRW {stats?.avgOrderValue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-sm text-white/80 mt-2">
              Per completed transaction
            </p>
          </CardContent>
        </Card>

        {/* Active Staff Card - Amber Gradient */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Active Staff</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">
              {stats?.activeStaff || 0}
            </div>
            <p className="text-sm text-white/80 mt-2">
              Logged in this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common admin tasks</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {quickActions.length} actions
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  onClick={action.action}
                  className="group relative flex flex-col items-center justify-center p-6 border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`} />
                  <div className={`p-3 bg-gradient-to-br ${action.color} rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-center">{action.title}</h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    {action.description}
                  </p>
                  <ArrowRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inventory Alerts</CardTitle>
                <CardDescription>Products needing attention</CardDescription>
              </div>
              <Badge variant={inventoryAlerts.length > 0 ? "destructive" : "secondary"}>
                {inventoryAlerts.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {inventoryAlerts.length > 0 ? (
              <div className="space-y-3">
                {inventoryAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.product_id}
                    className="group flex items-center justify-between p-3 border rounded-lg hover:border-destructive/50 hover:bg-destructive/5 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/inventory?product=${alert.product_id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{alert.product_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Stock: {alert.current_stock}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Min: {alert.min_stock}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {alert.percentage}%
                        </span>
                      </div>
                    </div>
                    <Badge variant={
                      alert.status === 'critical' ? 'destructive' :
                      alert.status === 'low' ? 'default' : 'secondary'
                    } className="ml-2">
                      {alert.status}
                    </Badge>
                    <ArrowRight className="ml-2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
                {inventoryAlerts.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push('/dashboard/inventory?filter=low-stock')}
                  >
                    View all {inventoryAlerts.length} alerts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">All inventory levels are optimal</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push('/dashboard/inventory')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Inventory
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest completed orders</CardDescription>
              </div>
              <Badge variant="outline">
                {stats?.recentTransactions?.length || 0} recent
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {stats.recentTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="group flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/transactions/${transaction.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium text-sm truncate">{transaction.transaction_number}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {transaction.payment_method}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(transaction.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">FRW {transaction.total_amount.toLocaleString()}</p>
                      <Badge 
                        variant={transaction.status === 'completed' ? 'default' : 'secondary'} 
                        className="text-xs mt-1"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                    <ArrowRight className="ml-2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push('/dashboard/transactions')}
                >
                  View all transactions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No recent transactions</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push('/dashboard/transactions')}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View Transactions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>Revenue by product category</CardDescription>
              </div>
              <Badge variant="outline">
                {topCategories.length || 0} categories
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {topCategories.length > 0 ? (
              <div className="space-y-4">
                {topCategories.map((category, index) => (
                  <div 
                    key={category.name} 
                    className="group space-y-2 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    onClick={() => router.push(`/dashboard/inventory?category=${encodeURIComponent(category.name)}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-emerald-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-purple-500' : 'bg-muted-foreground'
                        }`} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">FRW {category.revenue.toLocaleString()}</span>
                        <div className={`flex items-center text-xs ${
                          category.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {category.change >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(category.change)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            index === 0 ? 'bg-emerald-500' :
                            index === 1 ? 'bg-blue-500' :
                            index === 2 ? 'bg-purple-500' : 'bg-muted-foreground'
                          }`}
                          style={{
                            width: `${Math.min((category.revenue / (topCategories[0]?.revenue || 1)) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {category.transactions} transactions
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push('/dashboard/statistics?tab=categories')}
                >
                  View all category analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No category data available</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push('/dashboard/inventory?filter=with-category')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Categories
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Status
          </CardTitle>
          <CardDescription>Current system health and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
              <p className="text-2xl font-bold mt-1">{stats?.pendingOrders || 0}</p>
            </div>
            <div className="p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold mt-1">{stats?.lowStockItems || 0}</p>
            </div>
            <div className="p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <p className="text-sm font-medium text-muted-foreground">Top Categories</p>
              <p className="text-2xl font-bold mt-1">{topCategories.length}</p>
            </div>
            <div className="p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <p className="text-sm font-medium text-muted-foreground">System Health</p>
              <p className="text-2xl font-bold mt-1 text-green-600">Good</p>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}