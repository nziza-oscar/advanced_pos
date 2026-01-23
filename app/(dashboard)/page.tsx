'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/pos/ProductCard';
import { SearchBar } from '@/components/layout/SearchBar';
import { useModalStore } from '@/lib/store/modal-store';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Scan } from 'lucide-react';
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

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { openModal } = useModalStore();
  const { itemsCount, totalAmount } = useCartSummary();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickView = (product: Product) => {
    openModal('checkout', { product });
  };

  const handleScanClick = () => {
    openModal('scanner');
  };

  const handleAddProduct = () => {
    openModal('add-product');
  };

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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">POS Dashboard</h1>
          <p className="text-gray-600">Manage your sales and inventory</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleScanClick} variant="outline">
            <Scan className="w-4 h-4 mr-2" />
            Scan Barcode
          </Button>
          
          <Button onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Cart Summary */}
      {itemsCount > 0 && (
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Cart Summary</h3>
              <p className="text-sm text-gray-600">
                {itemsCount} items • Total: ${totalAmount.toFixed(2)}
              </p>
            </div>
            <Button onClick={handleCheckout}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Checkout
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search products by name or barcode..."
        />
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Products ({filteredProducts.length})
          </h2>
          {loading && (
            <span className="text-sm text-gray-500">Loading...</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border">
            <div className="text-gray-400 mb-4">
              <Scan className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try a different search term' : 'Add your first product to get started'}
            </p>
            <Button onClick={handleAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}