'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useModalStore } from '@/lib/store/modal-store';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function ConfirmationModal() {
  const { isOpen, type, data, closeModal } = useModalStore();
  
  // Only show if the modal is open AND the type is confirmation
  const isOpenModal = isOpen && type === 'confirmation';

  const handleConfirm = () => {
    if (data?.onConfirm) {
      data.onConfirm();
    }
    closeModal();
  };

  const handleCancel = () => {
    if (data?.onCancel) {
      data.onCancel();
    }
    closeModal();
  };

  return (
    <Dialog open={isOpenModal} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {data?.title?.toLowerCase().includes('delete') || data?.title?.toLowerCase().includes('warning') ? (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {data?.title || 'Confirm Action'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-700">
            {data?.message || 'Are you sure you want to proceed?'}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            {data?.cancelText || 'Cancel'}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex-1"
            variant={data?.title?.toLowerCase().includes('delete') ? 'destructive' : 'default'}
          >
            {data?.confirmText || 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}