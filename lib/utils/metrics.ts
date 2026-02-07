import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Download,
  FileSpreadsheet,
  PieChart,
  CreditCard,
  BookA,
  Calendar
} from 'lucide-react';

const formatNumber = (num: number) => {
  return num.toLocaleString('en-RW');
};

const formatCurrency = (amount: number) => {
  return `FRW ${Number(amount).toLocaleString('en-RW')}`;
};

export function adminMetric(summary:any){
    return  [
    { 
      label: 'Total Revenue', 
      value: formatCurrency(summary.revenue),
      trend: summary.revenueChange, 
      icon: DollarSign, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Avg. Order Value', 
      value: formatCurrency(summary.avgOrderValue), // Changed from $ to FRW
      trend: summary.avgOrderChange, 
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: 'Total Transactions', 
      value: formatNumber(summary.transactions), // Just numbers
      trend: summary.transactionChange, 
      icon: ShoppingBag, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
    { 
      label: 'Active Staff', 
      value: summary?.activeStaff?.toString(), 
      trend: 0,
      icon: Users, 
      color: 'text-sky-600', 
      bg: 'bg-sky-50' 
    },
  ];
}