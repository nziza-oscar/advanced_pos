'use client';

import { ReactNode, useState } from 'react';
import { 
  ShoppingCart, 
  History, 
  UserCircle,
  ChartBar,
  Box,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScannerModal } from '@/components/shared/ScannerModal';
import { CashierHeader } from '@/components/layout/CashierHeader';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Logo } from '@/components/shared/Logo';

export default function CashierLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'POS Terminal', href: '/cashier', icon: ShoppingCart },
    { name: 'My Sales', href: '/cashier/sales', icon: History },
    { name: 'Our Products', href: '/cashier/products', icon: Box },
    { name: 'Statistics', href: '/cashier/statistics', icon: ChartBar },
    { name: 'Profile', href: '/cashier/profile', icon: UserCircle },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header with Menu Trigger */}
      <CashierHeader onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-300 transform transition-transform duration-300 ease-in-out flex flex-col py-6 px-4
          md:relative md:translate-x-0 md:w-20 lg:w-64 md:flex md:z-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Mobile Close Button */}
          <div className="flex justify-between items-center mb-8 md:hidden">
            <Logo/>
            <button onClick={closeSidebar} className="p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-blue-200' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                  <span className={`md:hidden lg:block font-medium text-sm`}>
                    {item.name}
                  </span>
                  
                  {/* Tooltip for md:w-20 state */}
                  <span className="hidden md:group-hover:block lg:hidden absolute left-16 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
          
          <div className="pt-6 border-t border-slate-100">
            <p className="hidden lg:block text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4">
              System Version 1.0.4
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6 pb-24 md:pb-6">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
        
        <ScannerModal />
      </div>

      {/* Bottom Nav for Mobile */}
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}