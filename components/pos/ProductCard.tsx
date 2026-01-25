'use client';

import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, Tag, Plus } from 'lucide-react';
import { cn } from '@/lib/utils'; // Standard shadcn utility for classes

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering any parent click events
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

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1">
      
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <Tag className="w-10 h-10 text-slate-300" />
          </div>
        )}

        {/* Status Badges - Glassmorphism style */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {isOutOfStock ? (
            <Badge className="bg-red-500/80 backdrop-blur-md border-none text-white shadow-sm">
              Sold Out
            </Badge>
          ) : isLowStock ? (
            <Badge className="bg-amber-500/80 backdrop-blur-md border-none text-white shadow-sm">
              Only {product.stock_quantity} Left
            </Badge>
          ) : null}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full w-10 h-10 shadow-xl scale-75 group-hover:scale-100 transition-transform duration-300 delay-75"
            onClick={() => onQuickView?.(product)}
          >
            <Eye className="w-5 h-5 text-slate-700" />
          </Button>
          <Button
            size="icon"
            className="rounded-full w-10 h-10 bg-blue-600 hover:bg-blue-700 shadow-xl scale-75 group-hover:scale-100 transition-transform duration-300 delay-150"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <Plus className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
            {product.barcode}
          </p>
          <h3 className="font-semibold text-slate-800 text-base leading-tight group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Price</span>
            <span className="text-lg font-black text-slate-900">
              {Number(product.price).toLocaleString()} <span className="text-xs font-normal">FRW</span>
            </span>
          </div>
          
          <button 
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={cn(
                "p-2 rounded-xl transition-all duration-200",
                isOutOfStock 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
            )}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}