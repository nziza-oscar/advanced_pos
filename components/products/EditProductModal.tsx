'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useModalStore } from '@/lib/store/modal-store';
import { toast } from 'sonner';
import { Edit, UploadCloud, Package, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost_price: number | null;
  stock_quantity: number;
  min_stock_level: number;
  image_url: string | null;
  category_id: string | null;
  is_active: boolean;
  barcode: string;
  created_at: string;
  updated_at: string;
}

export function EditProductModal() {
  const { isOpen, type, data, closeModal } = useModalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost_price: '',
    price: '',
    stock_quantity: '',
    min_stock_level: '',
    category_id: '',
    is_active: true,
  });

  const isOpenModal = isOpen && type === 'edit-product';

  // Fetch product and categories when modal opens
  useEffect(() => {
    if (data?.productId) {
      fetchProduct(data.productId);
      fetchCategories();
    }
  }, [data?.productId]);

  // Fetch product details
  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setProduct(result.data);
        setFormData({
          name: result.data.name,
          description: result.data.description || '',
          cost_price: result.data.cost_price?.toString() || '',
          price: result.data.price.toString(),
          stock_quantity: result.data.stock_quantity.toString(),
          min_stock_level: result.data.min_stock_level?.toString() || '5',
          category_id: result.data.category_id || '',
          is_active: result.data.is_active,
        });
        
        if (result.data.image_url) {
          setPreviewUrl(result.data.image_url);
        }
      } else {
        toast.error(result.error || 'Failed to load product');
      }
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error("Failed to load categories");
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large. Max 2MB.");
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);

    try {
      const costPrice = parseFloat(formData.cost_price) || 0;
      const sellingPrice = parseFloat(formData.price) || 0;

      // Validate price
      if (sellingPrice < costPrice) {
        toast.error("Selling price cannot be lower than cost price");
        setSaving(false);
        return;
      }

      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('cost_price', costPrice.toString());
      formDataToSend.append('price', sellingPrice.toString());
      formDataToSend.append('stock_quantity', formData.stock_quantity);
      formDataToSend.append('min_stock_level', formData.min_stock_level);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('is_active', formData.is_active.toString());

      // Add image if changed
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        formDataToSend.append('image', file);
      }

      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Product updated successfully!');
        closeModal();
      } else {
        toast.error(result.error || 'Failed to update product');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Remove image preview
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Close modal handler
  const handleClose = () => {
    closeModal();
    setProduct(null);
    setPreviewUrl(null);
    setFormData({
      name: '',
      description: '',
      cost_price: '',
      price: '',
      stock_quantity: '',
      min_stock_level: '',
      category_id: '',
      is_active: true,
    });
  };

  if (!isOpenModal) return null;

  return (
    <Dialog open={isOpenModal} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-slate-200 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
            <Edit className="w-5 h-5 text-blue-600" />
            Edit Product
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        ) : product ? (
          <>
            <div className="mb-4 space-y-2">
              <p className="text-sm font-mono text-slate-500">Barcode: {product.barcode}</p>
              <p className="text-xs text-slate-400">
                Created: {new Date(product.created_at).toLocaleDateString()}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Product Image</Label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                {previewUrl ? (
                  <div className="relative h-40 w-full rounded-xl border-2 border-blue-100 overflow-hidden bg-slate-50 group">
                    <Image 
                      src={previewUrl} 
                      alt={formData.name || 'Product'} 
                      fill 
                      className="object-contain p-2" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change
                      </Button>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleRemoveImage}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50 transition-all cursor-pointer group"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                    <p className="text-sm font-semibold text-slate-500 group-hover:text-blue-600">
                      {product.image_url ? 'Change Image' : 'Add Image (Max 2MB)'}
                    </p>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    disabled={saving}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="Product description..."
                    rows={3}
                    disabled={saving}
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => handleSelectChange('category_id', value)}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* FIX: Removed empty value SelectItem */}
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cost_price">Cost Price (FRW)</Label>
                    <Input 
                      id="cost_price" 
                      name="cost_price"
                      type="number" 
                      value={formData.cost_price} 
                      onChange={handleChange} 
                      min="0"
                      step="0.01"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="price">Selling Price (FRW) *</Label>
                    <Input 
                      id="price" 
                      name="price"
                      type="number" 
                      value={formData.price} 
                      onChange={handleChange} 
                      required
                      min="0"
                      step="0.01"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Stock Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="stock_quantity">Current Stock</Label>
                    <Input 
                      id="stock_quantity" 
                      name="stock_quantity"
                      type="number" 
                      value={formData.stock_quantity} 
                      onChange={handleChange} 
                      min="0"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="min_stock_level">Min Stock Level</Label>
                    <Input 
                      id="min_stock_level" 
                      name="min_stock_level"
                      type="number" 
                      value={formData.min_stock_level} 
                      onChange={handleChange} 
                      min="0"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active" className="text-slate-700">Product Status</Label>
                    <p className="text-xs text-slate-500">
                      {formData.is_active ? 'Product is visible to customers' : 'Product is hidden'}
                    </p>
                  </div>
                  <Switch 
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose} 
                  className="flex-1" 
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700" 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-10 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Product not found</p>
            <Button 
              onClick={handleClose}
              className="mt-4"
              variant="outline"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}