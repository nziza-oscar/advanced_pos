'use client';

import { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  User, 
  ShoppingCart, 
  Search, 
  Package, 
  Trash2, 
  ArrowRight,
  LogOut,
  Settings,
  UserCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useCartStore, useCartSummary } from '@/lib/store/cart-store';
import Link from 'next/link';
import { CheckoutModal } from '../pos/CheckoutModal';
import ProductSearch from '../products/ProductSearch';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: string;
}

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

 
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const { itemsCount, totalAmount } = useCartSummary();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await fetch('/api/auth/me');
        const result = await res.json();
        if (result.success) {
          setProfile(result.data.user);
        }
      } catch (error) {
        console.error("Auth sync failed");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center overflow-hidden justify-between border-b border-slate-300 bg-white px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-slate-500"
          >
            <Menu className="w-5 h-5" />
          </Button>

         <ProductSearch/>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
         
          
          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2.5 px-2 hover:bg-slate-100 h-10 transition-all focus:ring-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
                  {loadingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-xs uppercase">{getInitials(profile?.full_name || '??')}</span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-xs text-blue-600 leading-none">
                    {loadingProfile ? 'Checking...' : profile?.full_name}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">
                    {loadingProfile ? 'Session' : profile?.role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl border-slate-200">
              <DropdownMenuLabel className="px-2 py-2 text-[10px] text-slate-500 uppercase tracking-widest">Account Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer py-2.5 rounded-md gap-3">
                <UserCircle className="w-4 h-4 text-slate-400" />
                <span className="text-sm">My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2.5 rounded-md gap-3">
                <Settings className="w-4 h-4 text-slate-400" />
                <span className="text-sm">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer py-2.5 rounded-md gap-3" 
                onClick={() => window.location.href = '/login'}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CheckoutModal 
        open={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </>
  );
}