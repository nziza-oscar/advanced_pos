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

  const [notifications] = useState([
    { id: 1, title: 'Low Stock Alert', desc: 'Product "Milk" is below 5 units.', time: '2m ago' },
    { id: 2, title: 'New Sale', desc: 'Transaction #4029 completed.', time: '15m ago' },
  ]);

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
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-slate-500"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="hidden md:flex relative w-full max-w-sm items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search products or orders..."
              className="pl-9 h-9 w-full bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none">
                <ShoppingCart className="w-5 h-5 text-slate-600" />
                {itemsCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white ring-2 ring-white animate-in zoom-in duration-300">
                    {itemsCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2 shadow-xl border-slate-200">
              <div className="flex justify-between items-center px-2 py-1.5">
                 <DropdownMenuLabel className="p-0 text-slate-900 text-sm">Current Cart</DropdownMenuLabel>
                 <span className="text-[10px] text-slate-500 uppercase tracking-wider">{itemsCount} Items</span>
              </div>
              <DropdownMenuSeparator />
              
              {itemsCount === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <ShoppingCart className="w-8 h-8 opacity-20" />
                  <p className="text-sm italic">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md group transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-slate-100 rounded flex items-center justify-center border border-slate-200">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <p className="text-xs text-slate-800 line-clamp-1">{item.name}</p>
                              <p className="text-[10px] text-slate-500">
                                {item.quantity} × {Number(item.price).toLocaleString()} FRW
                              </p>
                            </div>
                         </div>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.preventDefault();
                            removeItem(item.id);
                          }}
                          className="h-8 w-8 text-slate-300 hover:text-red-500 group-hover:opacity-100 transition-all"
                         >
                            <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-slate-500 uppercase tracking-tighter">Total</span>
                      <span className="text-sm text-blue-600">{Number(totalAmount ).toLocaleString()} FRW</span>
                    </div>
                    <DropdownMenuItem className="p-0 focus:bg-transparent">
                        <Button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 gap-2">
                          Checkout Now
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                    </DropdownMenuItem>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none">
                <Bell className="w-5 h-5 text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white ring-2 ring-white">
                    {notifications.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 shadow-xl border-slate-200">
              <DropdownMenuLabel className="flex justify-between items-center px-4 py-3">
                <span className="text-slate-900">Notifications</span>
                <button className="text-[10px] text-blue-600 hover:underline">Mark all as read</button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-4 cursor-pointer border-b border-slate-50 last:border-0">
                    <p className="text-xs text-slate-900">{notif.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{notif.desc}</p>
                    <p className="text-[9px] text-blue-500 mt-1 uppercase tracking-wide">{notif.time}</p>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <Link href="/notifications" className="w-full">
                <DropdownMenuItem className="text-center justify-center text-xs text-slate-600 py-3 cursor-pointer">
                  View All Activity
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

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