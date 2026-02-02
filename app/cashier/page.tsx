'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Package, Plus, Minus, Trash2, ReceiptText, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCartStore, useCartSummary } from '@/lib/store/cart-store';
import { CheckoutModal } from '@/components/pos/CheckoutModal';


export default function CashierPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [open,setOpen] = useState(false)
  
  // Destructure store 
  
  const { addItem, items, updateQuantity, removeItem,totalAmount } = useCartStore();
  const {  itemsCount } = useCartSummary();


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) setProducts(data.data);
      } catch (error) {
        console.error("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode?.includes(search)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-h-[calc(100vh-120px)]">
      
      {/* 1. Product Selection Zone (Left) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name or scan barcode..." 
              className="pl-10 h-12 bg-white rounded-xl border border-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
         
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addItem(product)}
              className="group flex flex-col bg-white p-3 rounded-3xl border border-transparent hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-left relative overflow-hidden"
            >
              <div className="aspect-square bg-slate-50 rounded-2xl mb-3 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                ) : (
                  <Package className="w-8 h-8 text-slate-200" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">{product.name}</h3>
              <p className="text-xs text-slate-400 mt-1 mb-2">{product.stock_quantity} units left</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-blue-600 font-bold text-sm">{Number(product.price).toLocaleString()} FRW</span>
                <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Order Summary Zone (Right) */}
      <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-blue-500" /> Current Order
          </h2>
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
            {itemsCount} Items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {itemsCount === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <p className="text-sm italic">Cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product_id} className="flex gap-3 bg-slate-50 p-3 rounded-2xl group">
                <div className="w-12 h-12 rounded-xl bg-white flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-semibold text-slate-800 truncate pr-2">{item.name}</h4>
                    <button 
                      onClick={() => removeItem(item.product_id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3 bg-white rounded-lg border border-slate-100 p-1">
                      <button 
                        onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                        className="w-6 h-6 flex items-center justify-center hover:bg-slate-50 rounded text-slate-500"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-slate-50 rounded text-slate-500"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-blue-600">
                      {(Number(item.unit_price) * item.quantity).toLocaleString()} FRW
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>{Number(totalAmount).toLocaleString()} FRW</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-xl pt-2 border-t border-slate-200">
              <span>Total</span>
              <span className="text-blue-600">{Number(totalAmount).toLocaleString()} FRW</span>
            </div>
          </div>
          
          <Button 
            disabled={itemsCount === 0}
            onClick={()=>setOpen(true)}
            className='w-full'
          >
            Checkout
          </Button>
        </div>
      </div>
      <CheckoutModal open={open} onClose={()=>setOpen((prev)=>!prev)}/>
    </div>
  );
}