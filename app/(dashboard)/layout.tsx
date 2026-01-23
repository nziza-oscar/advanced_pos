'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ModalProvider } from '@/components/shared/ModalProvider';
import { CheckoutModal } from '@/components/pos/CheckoutModal';
import { BarcodeScanner } from '@/components/pos/BarcodeScanner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <ModalProvider>
        <CheckoutModal />
        <BarcodeScanner />
      </ModalProvider>
    </div>
  );
}