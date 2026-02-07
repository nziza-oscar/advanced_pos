'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Plus, Search, Loader2 } from 'lucide-react';
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
  const openModal = useModalStore((state) => state.openModal);

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
      console.error('Failed to load inventory.');
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

  /**
   * Fixed Variant Mapping
   * Maps status logic to valid Shadcn Badge variants: 
   * "default" | "secondary" | "destructive" | "outline"
   */
  const getStockColor = (quantity: number, minLevel: number): "default" | "secondary" | "destructive" | "outline" => {
    if (quantity === 0) return 'destructive';
    if (quantity <= minLevel) return 'secondary'; // Using secondary for "Warning"
    return 'outline'; // Using outline for "Success/Normal"
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Monitor stock levels and replenish products.</p>
        </div>
        
        <Button onClick={() => openModal('add-product')}>
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
                {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} need{lowStockProducts.length === 1 ? 's' : ''} restocking.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSearch('')}>
              View All
            </Button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search inventory by name or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={fetchProducts} variant="secondary">
            Refresh
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
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
                  <TableHead className="text-right">Action</TableHead>
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
                      <span className={`font-bold ${product.stock_quantity <= product.min_stock_level ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stock_quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {product.min_stock_level}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStockColor(product.stock_quantity, product.min_stock_level)}>
                        {getStockStatus(product.stock_quantity, product.min_stock_level)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        Restock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredProducts.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                <p className="text-lg font-medium">
                  {search ? 'No products match your search.' : 'No products in inventory.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}