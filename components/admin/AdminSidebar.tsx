// components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  CreditCard,
  Settings,
  TrendingUp,
  Bell,
  LogOut,
  X,
  BookOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    mobileOnly: false
  },
  {
    title: 'Tenants',
    href: '/admin/tenants',
    icon: Building2,
    mobileOnly: false
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    mobileOnly: false
  },
 
  {
    title: 'Transactions',
    href: '/admin/transactions',
    icon: CreditCard,
    mobileOnly: false
  },
    {
    title: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: BookOpen,
    mobileOnly: false
  },

  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: TrendingUp,
    mobileOnly: false
  },
  {
    title: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    mobileOnly: false
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    mobileOnly: false
  }
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 md:w-72 h-full bg-gray-900 text-white flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold">POS Admin</h1>
            <p className="text-xs text-gray-400 mt-1 hidden sm:block">Super Admin Panel</p>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 md:px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center px-3 md:px-4 py-2.5 md:py-3 text-sm rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <item.icon className={`w-4 h-4 md:w-5 md:h-5 mr-3 flex-shrink-0 ${
                isActive ? 'text-blue-400' : ''
              }`} />
              <span className="text-sm md:text-base truncate">{item.title}</span>
              {isActive && (
                <div className="ml-auto w-1 h-6 bg-blue-500 rounded-full hidden md:block" />
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-3 md:p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center w-full px-3 md:px-4 py-2.5 md:py-3 text-sm text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5 mr-3 flex-shrink-0" />
          <span className="text-sm md:text-base">
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </aside>
  );
}