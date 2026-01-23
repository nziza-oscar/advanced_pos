'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function BarcodeScanner() {
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const handleScan = async () => {
    if (!barcode.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/barcode?barcode=${barcode}`);
      const data = await res.json();
      
      if (data.success) {
        setProduct(data.data);
        // Auto-open checkout modal or add to cart
      } else {
        alert('Product not found');
      }
    } catch (error) {
      console.error('Scan error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-scan when barcode is 13 digits (typical length)
  const handleInputChange = (value: string) => {
    setBarcode(value);
    if (value.length === 13) {
      handleScan();
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Scan or enter barcode"
          value={barcode}
          onChange={(e) => handleInputChange(e.target.value)}
          autoFocus
        />
        <Button onClick={handleScan} disabled={loading}>
          {loading ? 'Scanning...' : 'Scan'}
        </Button>
      </div>
      
      {product && (
        <div className="border p-4 rounded-lg">
          <h3 className="font-bold">{product.name}</h3>
          <p>Price: ${product.price}</p>
          <p>Stock: {product.stock_quantity}</p>
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="w-32 h-32 object-cover" />
          )}
        </div>
      )}
    </div>
  );
}