'use client';

import { useState } from 'react';
import { Menu, Bell, User, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartSummary } from '@/lib/store/cart-store';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [notifications, setNotifications] = useState(3);
  const { itemsCount } = useCartSummary();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6 lg:px-8">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Cart Indicator */}
      <div className="relative">
        <Button variant="ghost" size="sm" className="relative">
          <ShoppingCart className="w-5 h-5" />
          {itemsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {itemsCount}
            </span>
          )}
        </Button>
      </div>

      {/* Notifications */}
      <div className="relative">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {notifications}
            </span>
          )}
        </Button>
      </div>

      {/* User Profile */}
      <Button variant="ghost" size="sm">
        <User className="w-5 h-5 mr-2" />
        <span className="hidden sm:inline">Cashier</span>
      </Button>
    </header>
  );
}