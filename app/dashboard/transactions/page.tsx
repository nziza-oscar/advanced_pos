'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, Search, Download, Eye, Loader2 } from 'lucide-react';
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
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleViewDetails = (transaction: any) => {
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
   * Fixed Variant Mapping
   * Shadcn Badge variants: "default" | "secondary" | "destructive" | "outline"
   */
  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'completed': 
        return 'default'; // Represents success
      case 'pending': 
        return 'secondary'; // Represents warning/neutral
      case 'cancelled': 
        return 'destructive'; 
      default: 
        return 'outline';
    }
  };

  const getPaymentMethodColor = (method: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (method.toLowerCase()) {
      case 'cash': 
        return 'outline';
      case 'momo': 
        return 'secondary';
      default: 
        return 'default';
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
          <h1 className="text-2xl font-bold text-primary">Transactions</h1>
          <p className="text-gray-600">Sales history and receipts.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search Section */}
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
          <Button onClick={fetchTransactions}>
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
                  <TableHead className="w-[150px]">Transaction #</TableHead>
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
                  <TableRow key={transaction.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-mono font-medium text-blue-600">
                      {transaction.transaction_number}
                    </TableCell>
                    <TableCell>
                      {transaction.customer_name || 'Walk-in Customer'}
                    </TableCell>
                    <TableCell className="font-bold">
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
                    <TableCell>
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
                <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">
                  {search ? 'No transactions match your search.' : 'No transactions found.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <TransactionDetailModal 
        transaction={selectedTransaction}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}