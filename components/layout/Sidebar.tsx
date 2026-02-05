'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Package, Receipt, BarChart3, 
  Settings, Users, LogOut, X, ShoppingBag, 
  ChevronRight, LayoutDashboard, Boxes
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';

const menuItems = [
  { href: '/inventory_manager', icon: LayoutDashboard, label: 'Overview', accent: 'text-blue-500', bg: 'hover:bg-blue-50' },
  { href: '/inventory_manager/products', icon: Package, label: 'Products', accent: 'text-sky-500', bg: 'hover:bg-sky-50' },
  { href: '/inventory_manager/stock', icon: Boxes, label: 'Stock Levels', accent: 'text-indigo-500', bg: 'hover:bg-indigo-50' },
  { href: '/inventory_manager/categories', icon: ShoppingBag, label: 'Categories', accent: 'text-cyan-500', bg: 'hover:bg-cyan-50' },
  { href: '/inventory_manager/statistics', icon: BarChart3, label: 'Statistics', accent: 'text-blue-600', bg: 'hover:bg-blue-50' },
  { href: '/inventory_manager/settings', icon: Settings, label: 'Settings', accent: 'text-slate-400', bg: 'hover:bg-slate-100' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* 1. LAYERED OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-blue-900/5 backdrop-blur-sm lg:hidden transition-all duration-500"
          onClick={onClose}
        />
      )}

      {/* 2. SIDEBAR ASIDE */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#FBFDFF] border-r border-slate-400 transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between h-24 px-8">
          <Logo className="h-7 text-blue-600" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden rounded-2xl bg-white border border-blue-50 shadow-sm"
          >
            <X className="w-5 h-5 text-blue-400" />
          </Button>
        </div>

        {/* NAVIGATION */}
        <div className="flex flex-col h-[calc(100%-180px)] overflow-y-auto px-6 pt-2">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group relative flex items-center justify-between px-4 py-3 rounded-[1.5rem] transition-all duration-300
                    ${isActive
                      ? 'bg-primary text-blue-200 shadow-[0_10px_25px_-10px_rgba(59,130,246,0.15)] ring-1 ring-blue-50'
                      : `text-slate-400 ${item.bg} hover:text-blue-500`
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      p-2.5 rounded-2xl transition-all duration-300
                      ${isActive 
                        ? 'bg-blue-200 text-primary rotate-[5deg]' 
                        : `bg-white border border-blue-50 shadow-sm ${item.accent}`
                      }
                    `}>
                      <Icon className="w-4 h-4 stroke-[1.8]" />
                    </div>
                    <span className={`text-[14px] tracking-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>
                      {item.label}
                    </span>
                  </div>

                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="bg-white rounded-[2rem] p-4 border border-blue-50 shadow-sm">
            <Button
              variant="ghost"
              className="w-full h-12 rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 flex items-center justify-center gap-3 group"
              onClick={() => window.location.href = '/login'}
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}