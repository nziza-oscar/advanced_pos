'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Package, X, ShoppingCart, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/store/cart-store';

interface ProductSearchProps {
  placeholder?: string;
  className?: string;
}

export default function ProductSearch({ 
  placeholder = "Search products or scan barcode...", 
  className = "" 
}: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { addItem } = useCartStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        setIsOpen(true);
        try {
          const res = await fetch(`/api/inventory/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (data.success) {
            setResults(data.data);
          }
        } catch (error) {
          console.error("Search failed.");
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const formatFRW = (amount: number) => {
    return new Intl.NumberFormat('en-RW').format(amount) + ' FRW';
  };

  const handleAddToCart = (product: any) => {
    if (Number(product.stock_quantity) <= 0) return;
    
    addItem(product);
    setLastAddedId(product.id);
    
    setTimeout(() => setLastAddedId(null), 1500);
  };

  return (
    <div className={`flex-1 relative ${className}`} ref={dropdownRef}>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 h-11 w-full bg-white border border-slate-300 focus:border-blue-500 rounded-xl shadow-sm transition-all"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-3 w-3 text-slate-500" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[1000] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Searching Inventory</span>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-50 mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Items</span>
                  <span className="text-[10px] font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded uppercase">{results.length} found</span>
                </div>
                
                {results.map((product) => {
                  const isOutOfStock = Number(product.stock_quantity) <= 0;
                  const isJustAdded = lastAddedId === product.id;

                  return (
                    <div
                      key={product.id}
                      className={`w-full flex items-center gap-4 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors ${isOutOfStock ? 'opacity-60' : ''}`}
                    >
                      {/* Product Visual */}
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      
                      {/* Product Labels */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                          {product.barcode}
                        </p>
                      </div>

                      {/* Pricing Info */}
                      <div className="text-right flex flex-col items-end mr-2">
                        <p className="text-sm font-bold text-blue-600">{formatFRW(product.price)}</p>
                        <p className={`text-[9px] font-bold uppercase ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`}>
                          {isOutOfStock ? 'Sold Out' : `${product.stock_quantity} In Stock`}
                        </p>
                      </div>
                      
                      {/* Action Button (The only clickable part) */}
                      <button
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCart(product)}
                        className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all shadow-sm flex-shrink-0 ${
                          isJustAdded 
                            ? 'bg-green-600 text-white scale-110 shadow-green-200' 
                            : isOutOfStock 
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              : 'bg-white text-blue-600 border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95'
                        }`}
                        title={isOutOfStock ? "Out of stock" : "Add to cart"}
                      >
                        {isJustAdded ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <ShoppingCart className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center flex flex-col items-center gap-3">
                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-slate-200" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching products</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}