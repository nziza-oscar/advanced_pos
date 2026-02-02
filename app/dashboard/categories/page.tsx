'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
// Updated Icon Imports
import { 
  Folder, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Search, 
  Package, 
  TrendingUp,
  Layers
} from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';

interface Category {
  id: string;
  name: string;
  description?: string;
  product_count?: number;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { openModal, isOpen } = useUIStore();

  useEffect(() => {
    fetchCategories();
  }, [isOpen]); 

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Category deleted');
        fetchCategories();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    (category.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Categories</h1>
          <p className="text-slate-500">Manage and organize your product groups</p>
        </div>
        
        <Button onClick={() => openModal('add-category')} >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-500 font-medium">Loading inventory data...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Category Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Description</TableHead>
                <TableHead className="font-semibold text-slate-700">Items</TableHead>
                <TableHead className="font-semibold text-slate-700">Created At</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Layers className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-semibold text-slate-900">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 max-w-xs truncate">
                    {category.description || <span className="text-slate-300 italic">No description</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-none font-medium">
                      <Package className="w-3 h-3 mr-1" />
                      {category.product_count || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(category.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openModal('edit-category', { category })}>
                          <Edit className="w-4 h-4 mr-2 text-blue-600" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(category.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Stats Grid */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Categories" 
            value={categories.length} 
            icon={<Folder className="w-6 h-6 text-blue-600" />} 
            bgColor="bg-blue-50"
          />
          <StatCard 
            title="Total Products" 
            value={categories.reduce((acc, curr) => acc + (Number(curr.product_count) || 0), 0)} 
            icon={<Package className="w-6 h-6 text-green-600" />} 
            bgColor="bg-green-50"
          />
          <StatCard 
            title="Average Density" 
            value={`${Math.round(categories.reduce((acc, curr) => acc + (Number(curr.product_count) || 0), 0) / categories.length)} items/cat`} 
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />} 
            bgColor="bg-purple-50"
          />
        </div>
      )}
    </div>
  );
}

// Simple internal component for the stats to keep main code clean
function StatCard({ title, value, icon, bgColor }: { title: string, value: string | number, icon: React.ReactNode, bgColor: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
      </div>
      <div className={`p-3 ${bgColor} rounded-xl`}>
        {icon}
      </div>
    </div>
  );
}