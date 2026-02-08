'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Eye, Package, ImageIcon, Plus } from 'lucide-react';
import { useModalStore } from '@/lib/store/modal-store';
import { useProductStore, useProductOperations } from '@/lib/store/product-store';
import { toast } from 'sonner';
import Titles from '@/components/layout/Titles';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  description?: string;
  cost_price?: number;
  min_stock_level?: number;
  category_id?: string;
}

export default function ProductsPage() {
  const [localSearch, setLocalSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { openModal } = useModalStore();
  
  // Get Zustand store state and actions
  const { 
    products = [],
    filteredProducts = [],
    totalProducts = 0,
    isLoading = false,
    isSearching = false,
    searchTerm = '',
    setSearchTerm,
    selectedCategory = null,
    setSelectedCategory,
    fetchProducts
  } = useProductStore();
  
  const { 
    deleteProduct, 
    isDeleting = false
  } = useProductOperations();

  // Fetch products on initial load
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        await fetchProducts();
      } catch (error) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, setSearchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    const success = await deleteProduct(id);
    if (!success) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    openModal('edit-product', { productId: product.id });
  };

  const handleView = (product: Product) => {
    openModal('checkout', { product });
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !product.is_active
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'} successfully`);
        // Refresh products from store
        fetchProducts();
      } else {
        toast.error(data.error || 'Failed to update product status');
      }
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };



  // Calculate statistics with null checks
  const stats = useMemo(() => {
    // Ensure products is an array
    const productArray = Array.isArray(products) ? products : [];
    
    const activeProducts = productArray.filter(p => p?.is_active).length;
    const lowStockProducts = productArray.filter(p => 
      p?.stock_quantity > 0 && p?.stock_quantity <= (p?.min_stock_level || 5)
    ).length;
    const outOfStockProducts = productArray.filter(p => p?.stock_quantity === 0).length;
    
    return {
      active: activeProducts,
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      total: totalProducts || productArray.length
    };
  }, [products, totalProducts]);

  // Determine which products to display with null checks
  const displayedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return searchTerm ? (Array.isArray(filteredProducts) ? filteredProducts : []) : products;
  }, [products, filteredProducts, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Titles 
          title='Products' 
          description={`Manage your product inventory (${stats.total} products)`}
        />
        
        <Button onClick={() => openModal('add-product')}>
          <Package className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Total Products</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Low Stock</div>
          <div className="text-2xl font-bold text-amber-600">{stats.lowStock}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Out of Stock</div>
          <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or barcode..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              disabled={isSearching}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={!selectedCategory ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {/* Categories would be mapped here if available */}
          </div>
        </div>
        
        {/* Active filters display */}
        {(searchTerm || selectedCategory) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchTerm}"
                <button 
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1">
                Category: {selectedCategory}
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {(isLoading || loading) ? (
          <div className="p-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="p-20 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No products match your search' : 'No products found'}
            </p>
            {searchTerm ? (
              <Button 
                onClick={() => {
                  setLocalSearch('');
                  setSearchTerm('');
                }}
                className="mt-4"
                variant="outline"
              >
                Clear Search
              </Button>
            ) : (
              <Button 
                onClick={() => openModal('add-product')}
                className="mt-4"
              >
                <Package className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product Details</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedProducts.map((product:any) => (
                  <TableRow key={product?.id || ''} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                        {product?.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product?.name || 'Product'}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{product?.name || 'Unnamed Product'}</span>
                        <span className="text-xs font-mono text-gray-400">{product?.barcode || 'No barcode'}</span>
                        {product?.description && (
                          <span className="text-xs text-gray-500 truncate max-w-[200px]">
                            {product.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {Number(product?.price || 0).toLocaleString()} FRW
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (product?.stock_quantity || 0) === 0
                            ? 'bg-red-50 text-red-700'
                            : (product?.stock_quantity || 0) <= (product?.min_stock_level || 5)
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {product?.stock_quantity || 0}
                        </span>
                       
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={product?.is_active ? "default" : "outline"}
                        size="sm"
                        className={`px-2 py-1 text-xs font-medium ${
                          product?.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => product && handleToggleActive(product)}
                        disabled={!product}
                      >
                        {product?.is_active ? 'Active' : 'Inactive'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => product && handleView(product)}
                            disabled={!product}
                          >
                            <Eye className="w-4 h-4 mr-2" /> Quick Sale
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => product && handleEdit(product)}
                            disabled={!product}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => product && handleToggleActive(product)}
                            disabled={!product}
                          >
                            <Eye className="w-4 h-4 mr-2" /> 
                            {product?.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => product && handleDelete(product.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            disabled={isDeleting || !product}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> 
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}