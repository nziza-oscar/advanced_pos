'use client';

import { ReactNode, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { 
  ShoppingCart, 
  History, 
  UserCircle,
  ChartBar,
  Box
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import  {MobileNav}  from '@/components/layout/mobile-nav';
import { ScannerModal } from '@/components/shared/ScannerModal';
import { CashierHeader } from '@/components/layout/CashierHeader';

export default function CashierLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'POS Terminal', href: '/cashier', icon: ShoppingCart },
    { name: 'My Sales', href: '/cashier/sales', icon: History },
    { name: 'Our Products', href: '/cashier/products', icon: Box },
    { name: 'Statistics', icon: ChartBar, href: '/cashier/statistics' },
    { name: 'Profile', href: '/cashier/profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <CashierHeader onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-20 lg:w-64 bg-white border-r border-slate-300 hidden md:flex flex-col py-6 px-4">
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  pathname === item.href 
                    ? 'bg-primary text-white shadow-lg shadow-primary-200' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden lg:block font-medium text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>
          
          <div className="pt-6 border-t border-slate-100">
             {/* <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-blue-600 transition-colors">
                <HelpCircle className="w-5 h-5" />
                <span className="hidden lg:block text-sm font-medium">Support</span>
             </button> */}
          </div>
        </aside>

        {/* Added pb-20 for mobile to prevent bottom bar from covering content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6 pb-20 md:pb-6">
          {children}
        </main>
        
        <ScannerModal/>
      </div>


      {/* Integrated Mobile Nav */}
      <MobileNav />
    </div>
  );
}