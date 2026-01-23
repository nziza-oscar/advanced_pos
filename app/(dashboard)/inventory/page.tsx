'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Plus, Search } from 'lucide-react';
import { useModalStore } from '@/lib/store/modal-store';

interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  stock_quantity: number;
  min_stock_level: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?inStock=true');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const lowStockProducts = products.filter(
    product => product.stock_quantity <= product.min_stock_level
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.barcode.includes(search)
  );

  const getStockStatus = (quantity: number, minLevel: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= minLevel) return 'Low Stock';
    return 'In Stock';
  };

  const getStockColor = (quantity: number, minLevel: number) => {
    if (quantity === 0) return 'destructive';
    if (quantity <= minLevel) return 'warning';
    return 'success';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Monitor stock levels and replenish products</p>
        </div>
        
        <Button onClick={() => useModalStore.getState().openModal('add-product')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">
                Low Stock Alert
              </h3>
              <p className="text-yellow-700 text-sm mt-1">
                {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} need{lowStockProducts.length === 1 ? 's' : ''} restocking
              </p>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-3">
          <Input
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading inventory...</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">
                      {product.barcode}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {product.stock_quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.min_stock_level}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStockColor(product.stock_quantity, product.min_stock_level)}>
                        {getStockStatus(product.stock_quantity, product.min_stock_level)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Restock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {search ? 'No products match your search' : 'No products in inventory'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}