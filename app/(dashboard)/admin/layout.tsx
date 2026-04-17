'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSidebarOpen, useAdminActions } from '@/lib/store/adminSelectors';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarOpen = useSidebarOpen();
  const { setSidebarOpen, fetchStats } = useAdminActions();

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // Fetch initial data
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Check auth on client side
useEffect(() => {
  const checkAuth = async () => {
    try {
      // Just call the verify endpoint; it will send the cookie automatically.
      const response = await fetch('/api/auth/verify');
      if (!response.ok) {
        // If the API returns 401/403, the cookie is invalid or missing
        router.push('/login');
        return;
      }

      const data = await response.json();
      
      // Ensure only super_admins can stay in this layout
      if (!data.success || data.data.user?.role !== 'super_admin') {
        router.push('/unauthorized');
      }
      
      console.log("User verified:", data.data.user);
    } catch (error) {
      console.error("Auth verification failed", error);
      router.push('/login');
    }
  };
  
  checkAuth();
}, [router]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Fixed width */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <AdminSidebar />
      </aside>
      
      {/* Main content - Added lg:ml-64 to offset the fixed sidebar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="h-16 flex-shrink-0 border-b border-slate-200 bg-white sticky top-0 z-30">
          <AdminHeader />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="container mx-auto p-4 md:p-8 max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}