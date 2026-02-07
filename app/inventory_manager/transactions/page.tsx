'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye, Loader2, PackageX } from 'lucide-react';
import { TransactionDetailModal } from '@/components/pos/TransactionDetailModal';

interface Transaction {
  id: string;
  transaction_number: string;
  customer_name?: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions');
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fixed Status Color mapping to match Shadcn Badge variants.
   * "success" and "warning" are replaced with "outline" and "secondary".
   */
  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'completed': return 'outline'; // Standard for success in many shadcn setups
      case 'pending': return 'secondary'; // Standard for warning/neutral
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getPaymentMethodColor = (method: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (method.toLowerCase()) {
      case 'cash': return 'default';
      case 'momo': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.transaction_number.toLowerCase().includes(search.toLowerCase()) ||
    (transaction.customer_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">View sales history and receipts.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by transaction number or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={fetchTransactions} variant="secondary">
            Refresh
          </Button>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-gray-600 font-medium">Loading transactions...</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono font-medium text-sm">
                      {transaction.transaction_number}
                    </TableCell>
                    <TableCell>
                      {transaction.customer_name || 'Walk-in Customer'}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {Number(transaction.total_amount).toLocaleString()} FRW
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentMethodColor(transaction.payment_method)}>
                        {transaction.payment_method.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(transaction.status)}>
                        {transaction.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(transaction)} 
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredTransactions.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <PackageX className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                <p className="text-lg font-medium">
                  {search ? 'No transactions match your search.' : 'No transactions found.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal is rendered once outside the table for performance */}
      <TransactionDetailModal 
        transaction={selectedTransaction}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}