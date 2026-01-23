'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock_quantity: '0'
  });
  
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Upload image if exists
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.data.image_url;
      }
      
      // 2. Create product with auto-generated barcode
      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: formData.price,
          stock_quantity: formData.stock_quantity,
          image_url: imageUrl
        })
      });
      
      const productData = await productRes.json();
      
      if (productData.success) {
        alert('Product added! Barcode: ' + productData.data.barcode);
        // Reset form
        setFormData({ name: '', price: '', stock_quantity: '0' });
        setImage(null);
      }
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Product Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label>Price</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label>Initial Stock</Label>
        <Input
          type="number"
          value={formData.stock_quantity}
          onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
        />
      </div>
      
      <div>
        <Label>Product Image (Optional)</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
      </div>
      
      <Button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Product'}
      </Button>
    </form>
  );
}