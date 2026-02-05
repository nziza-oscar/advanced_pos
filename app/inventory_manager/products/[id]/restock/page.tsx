'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, 
  PackagePlus, 
  Loader2, 
  CheckCircle2, 
  Warehouse,
  ArrowUpRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function InventoryRestockPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const result = await res.json();
        if (result.success) {
          setProduct(result.data);
        } else {
          toast.error("Product not found");
          router.push('/inventory-manager/products');
        }
      } catch (error) {
        toast.error("Error loading product data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(quantity);

    if (!quantity || amount <= 0) {
      return toast.error("Please enter a valid quantity.");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${id}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: amount }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(`Inventory Updated`, {
          description: `${product.name} stock increased to ${result.data.new_total} units.`,
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
        });
        router.push('/inventory_manager/products');
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update stock");
      }
    } catch (error) {
      toast.error("A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-6 gap-2 text-slate-500 hover:text-slate-900 transition-colors rounded-lg"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Inventory
      </Button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
             
              <div>
                <h1 className="text-xl font-bold text-primary tracking-tight uppercase">Restock Product</h1>
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mt-0.5">Inventory Management</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleRestock} className="p-8 space-y-8">
          {/* Stock Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-xl bg-slate-800 text-white flex flex-col">
              <p className="text-[10px] font-medium text-slate-600 uppercase tracking-wider mb-1">Current Stock</p>
              <h3 className="text-2xl font-bold">{product?.stock_quantity || 0}</h3>
            </div>
            <div className="p-6 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 flex flex-col transition-all">
              <p className="text-[10px] font-medium text-blue-400 uppercase tracking-wider mb-1">Projected Total</p>
              <h3 className="text-2xl font-bold">
                {Number(product?.stock_quantity || 0) + (Number(quantity) || 0)}
              </h3>
            </div>
          </div>

          {/* Product Summary */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
             <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
                {product?.image_url ? (
                  <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <PackagePlus className="w-6 h-6" />
                  </div>
                )}
             </div>
             <div>
                <p className="text-base font-bold text-slate-800 leading-tight">{product?.name}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Barcode: {product?.barcode}</p>
             </div>
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
              Units Received <ArrowUpRight className="w-3 h-3 text-blue-500" />
            </label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="h-16 text-3xl font-bold rounded-xl border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-100 text-center transition-all bg-white"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-14 rounded-xl bg-primary text-white font-bold uppercase tracking-wider shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Update Stock Level"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}