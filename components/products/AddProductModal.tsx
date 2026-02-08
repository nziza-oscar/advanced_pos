'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModalStore } from '@/lib/store/modal-store';
import { useProductOperations } from '@/lib/store/product-store';
import { Plus, UploadCloud } from 'lucide-react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
}

export function AddProductModal() {
  const { isOpen, type, closeModal } = useModalStore();
  const { createProduct, isCreating } = useProductOperations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    cost_price: '',
    selling_price: '',
    stock_quantity: '0',
    description: '',
    min_stock_level: '5',
  });

  const isOpenModal = isOpen && type === 'add-product';

  // Fetch categories when the modal opens
  useEffect(() => {
    if (isOpenModal) {
      const fetchCategories = async () => {
        try {
          const res = await fetch('/api/categories');
          const data = await res.json();
          if (data.success) setCategories(data.data);
        } catch (error) {
          console.error("Failed to load categories");
        }
      };
      fetchCategories();
    }
  }, [isOpenModal]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        console.error("File is too large. Max 2MB.");
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id) {
      console.error("Please select a category");
      return;
    }

    const cost = parseFloat(formData.cost_price);
    const selling = parseFloat(formData.selling_price);

    if (selling < cost) {
      console.error("Selling price cannot be lower than cost price");
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    
    const productData = {
      name: formData.name,
      category_id: formData.category_id,
      cost_price: cost,
      selling_price: selling,
      stock_quantity: parseInt(formData.stock_quantity),
      description: formData.description || undefined,
      min_stock_level: parseInt(formData.min_stock_level) || 5,
    };

    const createdProduct = await createProduct(productData, file);
    
    if (createdProduct) {
      handleClose();
    }
  };

  const handleClose = () => {
    closeModal();
    setFormData({ 
      name: '', 
      category_id: '', 
      cost_price: '', 
      selling_price: '', 
      stock_quantity: '0',
      description: '',
      min_stock_level: '5'
    });
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpenModal) return null;

  return (
    <Dialog open={isOpenModal} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-slate-200 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
            <Plus className="w-5 h-5 text-blue-600" />
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload UI */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Product Image (Optional)</Label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            {previewUrl ? (
              <div className="relative h-40 w-full rounded-xl border-2 border-blue-100 overflow-hidden bg-slate-50 group">
                <Image src={previewUrl} alt="Preview" fill className="object-contain p-2" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Change
                  </Button>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => { 
                      setPreviewUrl(null); 
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50 transition-all cursor-pointer group"
              >
                <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                <p className="text-sm font-semibold text-slate-500 group-hover:text-blue-600">Click to upload (Max 2MB)</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Product Name *</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the product"
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(val) => setFormData({...formData, category_id: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cost_price">Cost Price (FRW) *</Label>
                <Input 
                  id="cost_price" 
                  type="number" 
                  value={formData.cost_price} 
                  onChange={(e) => setFormData({...formData, cost_price: e.target.value})} 
                  required 
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="selling_price">Selling Price (FRW) *</Label>
                <Input 
                  id="selling_price" 
                  type="number" 
                  value={formData.selling_price} 
                  onChange={(e) => setFormData({...formData, selling_price: e.target.value})} 
                  required 
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  value={formData.stock_quantity} 
                  onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} 
                  min="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="min_stock">Min Stock Level</Label>
                <Input 
                  id="min_stock" 
                  type="number" 
                  value={formData.min_stock_level} 
                  onChange={(e) => setFormData({...formData, min_stock_level: e.target.value})} 
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}