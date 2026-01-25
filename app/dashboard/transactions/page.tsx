'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, Search, Download, Eye } from 'lucide-react';
import { useModalStore } from '@/lib/store/modal-store';
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
      console.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'default';
      case 'momo': return 'secondary';
      default: return 'outline';
    }
  };


  const filteredTransactions = transactions.filter(transaction =>
    transaction.transaction_number.includes(search) ||
    (transaction.customer_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">View sales history and receipts</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-3">
          <Input
            placeholder="Search by transaction number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading transactions...</p>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono font-medium">
                      {transaction.transaction_number}
                    </TableCell>
                    <TableCell>
                      {transaction.customer_name || 'Walk-in Customer'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {Number(transaction.total_amount).toFixed(2)} FRW
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentMethodColor(transaction.payment_method)}>
                        {transaction.payment_method.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
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


<TransactionDetailModal 
        transaction={selectedTransaction}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
            {filteredTransactions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {search ? 'No transactions match your search' : 'No transactions found'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}