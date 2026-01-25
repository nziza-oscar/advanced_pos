'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Printer, 
  Eye, 
  Filter, 
  Receipt,
  TrendingUp
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CashierSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMySales = async () => {
      try {
        const res = await fetch('/api/transactions'); // Scoping is handled by your API middleware/logic
        const result = await res.json();
        if (result.success) {
          setSales(result.data);
        }
      } catch (error) {
        console.error("Failed to load sales history");
      } finally {
        setLoading(false);
      }
    };
    fetchMySales();
  }, []);

  // Filter logic
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => 
      sale.id.toLowerCase().includes(search.toLowerCase()) ||
      sale.customer_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [sales, search]);

  // Dynamic Summary Calculations
  const stats = useMemo(() => {
    const total = filteredSales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);
    const count = filteredSales.length;
    const average = count > 0 ? total / count : 0;
    return { total, count, average };
  }, [filteredSales]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Sales History</h1>
          <p className="text-sm text-slate-500">Real-time tracking of your transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 gap-2">
            <Calendar className="w-4 h-4" />
            Today
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-2xl gap-2 shadow-lg shadow-blue-100">
            <Printer className="w-4 h-4" />
            Export List
          </Button>
        </div>
      </div>

      {/* 2. Dynamic Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Revenue</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-slate-800">
              {stats.total.toLocaleString()} <span className="text-sm font-normal text-slate-400">FRW</span>
            </h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Sales</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">
            {stats.count} <span className="text-sm font-normal text-slate-400">Transactions</span>
          </h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Basket</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">
            {Math.round(stats.average).toLocaleString()} <span className="text-sm font-normal text-slate-400">FRW</span>
          </h3>
        </div>
      </div>

      {/* 3. Table Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search Receipt ID..." 
              className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="ghost" className="text-slate-500 gap-2">
            <Filter className="w-4 h-4" />
            Filter Status
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[150px] text-xs uppercase tracking-wider">Receipt ID</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Time</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Method</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Amount</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-.3s]" />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-.5s]" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <Receipt className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 italic">No transactions found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale: any) => (
                  <TableRow key={sale.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-900">
                      #{sale.id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-lg font-normal bg-slate-100 text-slate-600 border-none capitalize">
                        {sale.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-800">
                      {Number(sale.total_amount).toLocaleString()} FRW
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-xs text-slate-600">Paid</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}