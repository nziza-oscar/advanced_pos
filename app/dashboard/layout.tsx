'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { ModalProvider } from '@/components/shared/ModalProvider';
import { Footer } from '@/components/layout/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Fixed with soft blue theme */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area - Offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-8 flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
          <ModalProvider/>
        </main>
        <Footer/>
      </div>

     
    </div>
  );
}