'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModalStore } from '@/lib/store/modal-store';
import { toast } from 'sonner';
import { Plus, UploadCloud } from 'lucide-react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
}

export function AddProductModal() {
  const { isOpen, type, closeModal } = useModalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    cost_price: '',
    selling_price: '',
    stock_quantity: '0',
    image_file: null as File | null,
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
          toast.error("Failed to load categories");
        }
      };
      fetchCategories();
    }
  }, [isOpenModal]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large. Max 2MB.");
        return;
      }
      setFormData({ ...formData, image_file: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const checkAvailableBarcodes = async () => {
  try {
    const response = await fetch('/api/barcode/available');
    const data = await response.json();
    
    if (data.success) {
      if (data.data.available_count === 0) {
        toast.error('No barcodes available. Please comminicate admin first.');
        return false;
      }
      
      if (data.data.warning_level) {
        toast.warning(`Only ${data.data.available_count} barcodes available.`);
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to check barcodes:', error);
    return false;
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
 const hasBarcodes = await checkAvailableBarcodes();
  if (!hasBarcodes) return;
    if (!formData.category_id) {
      toast.error("Please select a category");
      return;
    }

    const cost = parseFloat(formData.cost_price);
    const selling = parseFloat(formData.selling_price);

    if (selling < cost) {
      toast.error("Selling price cannot be lower than cost price");
      return;
    }

    
    try {
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('category_id', formData.category_id);
      dataToSend.append('cost_price', formData.cost_price);
      dataToSend.append('selling_price', formData.selling_price);
      dataToSend.append('stock_quantity', formData.stock_quantity);
      if (formData.image_file) {
        dataToSend.append('image', formData.image_file);
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: dataToSend,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Product added successfully!');
        handleClose();
      }
       else  if (!data.success && data.errorType === 'NO_BARCODES_AVAILABLE') {
        // Show a more specific message with a link to generate barcodes
        toast.error(
          <div>
            No barcodes available. 
          </div>
        );
      }


    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeModal();
    setFormData({ name: '', category_id: '', cost_price: '', selling_price: '', stock_quantity: '0', image_file: null });
    setPreviewUrl(null);
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
            <Label className="text-slate-700 font-medium">Product Image</Label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            {previewUrl ? (
              <div className="relative h-40 w-full rounded-xl border-2 border-blue-100 overflow-hidden bg-slate-50 group">
                <Image src={previewUrl} alt="Preview" fill className="object-contain p-2" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>Change</Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => { setPreviewUrl(null); setFormData({...formData, image_file: null}); }}>Remove</Button>
                </div>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50 transition-all cursor-pointer group">
                <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                <p className="text-sm font-semibold text-slate-500 group-hover:text-blue-600">Click to upload</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>

            {/* Category Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
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
                <Label htmlFor="cost_price">Cost Price (FRW)</Label>
                <Input id="cost_price" type="number" value={formData.cost_price} onChange={(e) => setFormData({...formData, cost_price: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="selling_price">Selling Price (FRW)</Label>
                <Input id="selling_price" type="number" value={formData.selling_price} onChange={(e) => setFormData({...formData, selling_price: e.target.value})} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stock">Initial Stock</Label>
              <Input id="stock" type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={loading}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Uploading...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}