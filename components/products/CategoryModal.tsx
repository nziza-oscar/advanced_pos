'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUIStore } from '@/lib/store/ui-store'; // Using your UI store
import { toast } from 'sonner';
import { Plus, Edit, Folder } from 'lucide-react';

export function CategoryModal() {
  const { isOpen, modalType, modalData, closeModal } = useUIStore();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const isModalOpen = isOpen && (modalType === 'add-category' || modalType === 'edit-category');
  const isEdit = modalType === 'edit-category';

  // Sync state when modal opens for editing
  useEffect(() => {
    if (isEdit && modalData?.category) {
      setFormData({
        name: modalData.category.name || '',
        description: modalData.category.description || '',
      });
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [isEdit, modalData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit ? `/api/categories/${modalData.category.id}` : '/api/categories';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isEdit ? 'Category updated!' : 'Category created!');
        handleClose();
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeModal();
    setFormData({ name: '', description: '' });
  };

  if (!isModalOpen) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
            {isEdit ? (
              <Edit className="w-5 h-5 text-blue-600" />
            ) : (
              <Plus className="w-5 h-5 text-blue-600" />
            )}
            {isEdit ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Snacks, Drinks, etc."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description (Optional)</Label>
              <Textarea
                id="cat-desc"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Optional details..."
                className="resize-none h-24"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}