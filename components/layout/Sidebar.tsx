'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Package, Receipt, BarChart3, 
  Settings, Users, LogOut, X, ShoppingBag, 
  ChevronRight, Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';

// We assign a specific accent color to each route to break the "single color" feel
const menuItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', accent: 'text-rose-500', bg: 'hover:bg-rose-50' },
  { href: '/dashboard/products', icon: Package, label: 'Products', accent: 'text-amber-500', bg: 'hover:bg-amber-50' },
  { href: '/dashboard/categories', icon: ShoppingBag, label: 'Categories', accent: 'text-emerald-500', bg: 'hover:bg-emerald-50' },
  { href: '/dashboard/transactions', icon: Receipt, label: 'Transactions', accent: 'text-blue-500', bg: 'hover:bg-blue-50' },
  { href: '/dashboard/inventory', icon: BarChart3, label: 'Inventory', accent: 'text-purple-500', bg: 'hover:bg-purple-50' },
  { href: '/dashboard/customers', icon: Users, label: 'Customers', accent: 'text-cyan-500', bg: 'hover:bg-cyan-50' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', accent: 'text-slate-500', bg: 'hover:bg-slate-100' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* 1. LAYERED OVERLAY: Using a light blur instead of heavy black */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-md lg:hidden transition-all duration-500"
          onClick={onClose}
        />
      )}

      {/* 2. MULTI-SURFACE ASIDE: Off-white/Stone background */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-blue-200 border-r border-slate-200/60 transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* HEADER: Pure White to create elevation contrast */}
        <div className="flex items-center justify-between h-20 px-8 bg-white border-b border-slate-100">
          <Logo className="h-6 text-slate-900" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden rounded-full"
          >
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </div>

        {/* SCROLLABLE NAV SECTION */}
        <div className="flex flex-col h-[calc(100%-160px)] overflow-y-auto px-4 pt-6">
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group relative flex items-center justify-between px-4 py-2 rounded-2xl transition-all duration-300
                    ${isActive
                      ? 'bg-white text-slate-900 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.04)] ring-1 ring-slate-200'
                      : `text-slate-500 ${item.bg} hover:text-slate-900`
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      p-2 rounded-xl transition-colors
                      ${isActive ? 'bg-slate-900 text-white' : `bg-white shadow-sm border border-slate-100 ${item.accent}`}
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[13px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </div>

                  {/* Airbnb style "active" indicator */}
                  {isActive && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-slate-900" />
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. FOOTER: Floating Profile Card with Gradient Pop */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-xl shadow-slate-200/40">
           

            <Button
              variant="secondary"
              className="w-full h-11 rounded-xl bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:shadow-inner transition-all duration-300 flex items-center justify-center gap-2 group"
              onClick={() => window.location.href = '/login'}
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-tighter">Exit System</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}