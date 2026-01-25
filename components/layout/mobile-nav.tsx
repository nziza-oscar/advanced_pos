'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, History, ScanLine, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScannerModal } from '@/lib/store/modal-store'; // Adjust path as needed

const navItems = [
  { label: 'Home', icon: ShoppingCart, href: '/cashier' },
  { label: 'Sales', icon: History, href: '/cashier/sales' },
  { label: 'Scan', icon: ScanLine, href: '#', isButton: true }, 
  { label: 'Account', icon: UserCircle, href: '/cashier/profile' },
];

export function MobileNav() {
  const pathname = usePathname();
  const { openScannerModal } = useScannerModal();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          // Define the shared styles for Icon wrapper and Text
          const iconWrapperClass = cn(
            "p-2 rounded-2xl transition-all duration-200",
            isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-400 group-hover:text-slate-600"
          );

          const labelClass = cn(
            "text-[10px] font-bold uppercase tracking-wider",
            isActive ? "text-blue-600" : "text-slate-400"
          );

          // Render as a Button if isButton is true
          if (item.isButton) {
            return (
              <button
                key={item.label}
                onClick={openScannerModal}
                className="flex flex-col items-center gap-1 group outline-none"
              >
                <div className={cn(iconWrapperClass, "bg-slate-50 text-slate-600")}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className={labelClass}>{item.label}</span>
              </button>
            );
          }

          // Render as a Link otherwise
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={iconWrapperClass}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className={labelClass}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}