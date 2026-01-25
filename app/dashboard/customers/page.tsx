'use client';

import { useState, useEffect } from 'react';
import { Users, Search, ShoppingBag, Calendar, ArrowRight, UserCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  name: string;
  phone: string | null;
  total_orders: number;
  total_spent: number;
  last_visit: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) setCustomers(data.data);
    } catch (error) {
      toast.error('Failed to load customer list');
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl text-blue-600 tracking-tight">Purchase History Clients</h1>
          <p className="text-slate-500 text-sm">Extracted from {customers.length} unique transaction profiles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="col-span-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center px-4 ring-1 ring-slate-200/50">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <input 
              className="w-full bg-transparent border-none focus:ring-0 text-sm py-3 outline-none"
              placeholder="Search by name or MoMo number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
         <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between text-white shadow-xl shadow-slate-200">
            <div>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest">Revenue Impact</p>
               <p className="text-xl">{customers.reduce((acc, c) => acc + Number(c.total_spent), 0).toLocaleString()} FRW</p>
            </div>
            <UserCircle className="w-8 h-8 text-blue-400 opacity-50" />
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px] relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-blue-600 text-sm tracking-widest uppercase">Syncing Records...</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] text-blue-500 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] text-blue-500 uppercase tracking-widest text-center">Visit Count</th>
                <th className="px-8 py-5 text-[10px] text-blue-500 uppercase tracking-widest">Total Value</th>
                <th className="px-8 py-5 text-[10px] text-blue-500 uppercase tracking-widest">Last Transaction</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length > 0 ? (
                filtered.map((customer, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm text-slate-900 tracking-tight">{customer.name}</p>
                          <p className="text-xs text-slate-400 tracking-tight">{customer.phone || 'No Phone Record'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center">
                        <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs ring-1 ring-slate-200">
                          {customer.total_orders} Orders
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-900 italic">
                        {Math.round(customer.total_spent).toLocaleString()} <span className="text-[10px] text-slate-400 not-italic uppercase">FRW</span>
                      </p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs">{new Date(customer.last_visit).toLocaleDateString()}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <ArrowRight className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-slate-400 text-sm">
                    No matching customer records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}