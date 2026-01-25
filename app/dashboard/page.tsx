'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/pos/ProductCard';
import { SearchBar } from '@/components/layout/SearchBar';
import { useModalStore } from '@/lib/store/modal-store';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, Plus, Scan, 
  TrendingUp, Wallet, Package, ArrowUpRight 
} from 'lucide-react';
import { useCartSummary } from '@/lib/store/cart-store';
import { toast } from 'sonner';

interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
  is_active: boolean;
}

interface Stats {
  todaySales: number;
  totalIncome: number;
  totalOrders: number;
  lowStockItems: number;
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({
    todaySales: 0,
    totalIncome: 0,
    totalOrders: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { openModal } = useModalStore();
  const { itemsCount, totalAmount } = useCartSummary();

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/dashboard');
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) setProducts(data.data || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickView = (product: Product) => openModal('checkout', { product });
  const handleScanClick = () => openModal('scanner');
  const handleAddProduct = () => openModal('add-product');
  const handleCheckout = () => {
    if (itemsCount === 0) {
      toast.error('Cart is empty');
      return;
    }
    openModal('payment');
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery)
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">POS Dashboard</h1>
          <p className="text-slate-500 text-sm">Overview of your business performance</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleScanClick} className="rounded-xl border-slate-200 shadow-sm">
            <Scan className="w-4 h-4 mr-2" />
            Scan Barcode
          </Button>
          <Button onClick={handleAddProduct} className="rounded-xl bg-slate-900 shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Today's Sales" 
          value={`${stats.todaySales.toLocaleString()} FRW`} 
          icon={<TrendingUp className="w-5 h-5" />}
          trend="+12.5%"
          color="rose"
        />
        <StatCard 
          title="Total Income" 
          value={`${stats.totalIncome.toLocaleString()} FRW`} 
          icon={<Wallet className="w-5 h-5" />}
          trend="+4.2%"
          color="emerald"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders.toString()} 
          icon={<ShoppingCart className="w-5 h-5" />}
          trend="+8.1%"
          color="blue"
        />
        <StatCard 
          title="Low Stock" 
          value={stats.lowStockItems.toString()} 
          icon={<Package className="w-5 h-5" />}
          trend="Critical"
          color="amber"
          isWarning={stats.lowStockItems > 0}
        />
      </div>

      {/* Cart Summary (Floating UI Style) */}
      {itemsCount > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-6 border border-white/10 ring-4 ring-slate-900/5 transition-all">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Active Cart</h3>
                <p className="text-slate-400 text-sm font-medium">
                  {itemsCount} items selected • <span className="text-orange-400 font-bold">{totalAmount.toLocaleString()} FRW</span>
                </p>
              </div>
            </div>
            <Button onClick={handleCheckout} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-orange-500/20">
              Complete Checkout
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-100 p-2 shadow-sm">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search items by name, category, or scan barcode..."
        />
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest text-[11px]">
            Inventory Catalog ({filteredProducts.length})
          </h2>
          {loading && <span className="text-xs font-bold text-slate-400 animate-pulse">Syncing...</span>}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 h-72 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        ) : (
          <EmptyState onAdd={handleAddProduct} hasSearch={!!searchQuery} />
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color, isWarning }: any) {
  const colors: any = {
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl border ${colors[color]}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${isWarning ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
          {trend}
          {!isWarning && <ArrowUpRight className="w-3 h-3" />}
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

function EmptyState({ onAdd, hasSearch }: any) {
  return (
    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
      <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
        <Package className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        {hasSearch ? 'No products match' : 'Your shelf is empty'}
      </h3>
      <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto font-medium">
        {hasSearch ? 'Try adjusting your filters or search keywords' : 'Start growing your business by adding your first product'}
      </p>
      <Button onClick={onAdd} className="rounded-xl bg-slate-900 px-6 font-bold">
        Add Your First Product
      </Button>
    </div>
  );
}