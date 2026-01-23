'use client';

import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, Tag } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    barcode: string;
    name: string;
    price: number;
    image_url?: string;
    stock_quantity: number;
    is_active?: boolean;
  };
  onQuickView?: (product: any) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}_${Date.now()}`,
      product_id: product.id,
      barcode: product.barcode,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      max_quantity: product.stock_quantity
    });
  };

  const handleQuickView = () => {
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Tag className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-2 left-2">
          {isOutOfStock ? (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          ) : isLowStock ? (
            <Badge variant="warning" className="text-xs">
              Low Stock: {product.stock_quantity}
            </Badge>
          ) : (
            <Badge variant="success" className="text-xs">
              In Stock: {product.stock_quantity}
            </Badge>
          )}
        </div>

        {/* Quick View Button */}
        <button
          onClick={handleQuickView}
          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-medium text-gray-900 truncate mb-1">
          {product.name}
        </h3>

        {/* Barcode */}
        <p className="text-xs text-gray-500 font-mono mb-2">
          #{product.barcode}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </div>
  );
}