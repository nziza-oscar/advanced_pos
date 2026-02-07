'use client';

import { AddProductModal } from '@/components/products/AddProductModal';
import { EditProductModal } from '@/components/products/EditProductModal';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { CategoryModal } from '../products/CategoryModal';
import { ScannerModal } from './ScannerModal';

export function ModalProvider() {
  return (
    <>
      <CategoryModal/>
      <AddProductModal />
      <EditProductModal />
      <PaymentModal />
      <ScannerModal/>
      <ConfirmationModal />
    </>
  );
}