'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useModalStore } from '@/lib/store/modal-store';
import { toast } from 'sonner';
import { Edit } from 'lucide-react';

export function EditProductModal() {
  const { isOpen, type, data, closeModal } = useModalStore();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock_quantity: '',
  });

  const isOpenModal = isOpen && type === 'edit-product';

  useEffect(() => {
    if (data?.productId) {
      fetchProduct(data.productId);
    }
  }, [data?.productId]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.data);
        setFormData({
          name: data.data.name,
          price: data.data.price.toString(),
          stock_quantity: data.data.stock_quantity.toString(),
        });
      }
    } catch (error) {
      toast.error('Failed to load product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Product updated successfully!');
        closeModal();
      } else {
        toast.error(data.error || 'Failed to update product');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpenModal || !product) return null;

  return (
    <Dialog open={isOpenModal} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Product
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-sm text-gray-500">Barcode: {product.barcode}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="stock_quantity">Stock Quantity</Label>
            <Input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}