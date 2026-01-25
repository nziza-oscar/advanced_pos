'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image'; // Import Next.js Image component
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Eye, Package, ImageIcon } from 'lucide-react';
import { useModalStore } from '@/lib/store/modal-store';
import { toast } from 'sonner';

interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  image_url?: string; // Add image_url to interface
  created_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { openModal } = useModalStore();

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

  const handleDelete = async (id: string) => {
    // 1. Confirm with the user
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Product deleted successfully');
        // 2. Refresh the list locally or re-fetch
        setProducts((prev) => prev.filter(p => p.id !== id));
      } else {
        toast.error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      toast.error('A network error occurred while deleting');
    }
  };

  const handleEdit = (product: Product) => {
    // Passes the productId to the modal store so the Edit modal can fetch current data
    openModal('edit-product', { productId: product.id });
  };

  const handleView = (product: Product) => {
    // Opens a 'checkout' or 'quick-sale' modal with the full product object
    openModal('checkout', { product });
  };
  

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.barcode.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        
        <Button onClick={() => openModal('add-product')} className="bg-blue-600 hover:bg-blue-700">
          <Package className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-lg shadow p-4">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
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
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50/50">
                  <TableCell>
                    {/* Image Thumbnail Logic */}
                    <div className="relative h-12 w-12 rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{product.name}</span>
                      <span className="text-xs font-mono text-gray-400">{product.barcode}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {Number(product.price).toLocaleString()} FRW
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock_quantity === 0
                        ? 'bg-red-50 text-red-700'
                        : product.stock_quantity <= 5
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {product.stock_quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(product)}>
                          <Eye className="w-4 h-4 mr-2" /> Quick Sale
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}