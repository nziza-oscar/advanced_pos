'use client';

import { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  LogOut,
  Settings,
  UserCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useNotificationStore } from '@/lib/store/notification-store';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: string;
}

interface HeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: HeaderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const { notifications, unreadCount, fetchNotifications,markAsRead } = useNotificationStore();

useEffect(() => {
  fetchNotifications();
  const interval = setInterval(fetchNotifications, 60000);
  return () => clearInterval(interval);
}, []);


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
        console.error("Auth sync failed.");
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
      <header className="sticky top-0 z-30 flex h-16 w-full items-center  justify-between border-b border-gray-400 bg-background px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden rounded-none"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="hidden md:flex">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em]">System Admin</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 hover:bg-muted transition-colors focus:outline-none">
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center bg-primary text-[10px] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 border-muted rounded-none shadow-none p-0">
              <DropdownMenuLabel className="flex justify-between items-center px-4 py-3 bg-muted/50">
                <span className="text-[10px] font-bold uppercase tracking-widest">Notifications</span>
                <button className="text-[9px] uppercase font-bold hover:underline">Clear</button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="m-0" />
              <div className="max-h-80 overflow-y-auto">
               {notifications.slice(0, 5).map((notif) => (
                  <DropdownMenuItem 
                    key={notif.id} 
                    onClick={() => markAsRead(notif.id)}
                    className={`flex flex-col items-start gap-1 p-4 cursor-pointer border-b border-muted last:border-0 rounded-none focus:bg-muted transition-colors ${
                      !notif.is_read ? 'bg-primary/[0.03]' : ''
                    }`}
                  >
                    <div className="flex w-full justify-between items-center">
                      <p className={`text-[10px] font-bold uppercase tracking-tight ${!notif.is_read ? 'text-primary' : 'text-foreground'}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && <div className="h-1.5 w-1.5 bg-primary rounded-none" />}
                    </div>
                    
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>
                    
                    <p className="text-[9px] text-muted-foreground/60 mt-1 uppercase tracking-widest font-medium">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </DropdownMenuItem>
                ))}

{notifications.length === 0 && (
  <div className="p-8 text-center">
    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">No new alerts.</p>
  </div>
)}
              </div>
              <DropdownMenuSeparator className="m-0" />
              <Link href="/notifications" className="w-full">
                <DropdownMenuItem className="text-center justify-center text-[10px] font-bold uppercase tracking-widest py-3 cursor-pointer rounded-none">
                  All Activity
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-muted mx-1 hidden sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-muted h-12 transition-all rounded-none focus:ring-0">
                <div className="h-8 w-8 bg-primary flex items-center justify-center text-primary-foreground">
                  {loadingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-[10px] font-bold">{getInitials(profile?.full_name || '??')}</span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {loadingProfile ? 'Syncing' : profile?.full_name}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
                    {loadingProfile ? '...' : profile?.role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 p-0 shadow-none border-muted rounded-none">
              <DropdownMenuLabel className="px-4 py-3 text-[9px] text-muted-foreground uppercase tracking-[0.2em] bg-muted/30">
                User Management
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="m-0" />

              <DropdownMenuItem asChild className="cursor-pointer py-3 rounded-none gap-3 focus:bg-muted transition-colors px-4">
                <Link href="/profile" className="flex items-center w-full gap-3">
                  <UserCircle className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">My Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="cursor-pointer py-3 rounded-none gap-3 focus:bg-muted transition-colors px-4">
                <Link href="/settings" className="flex items-center w-full gap-3">
                  <Settings className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="m-0" />

              <DropdownMenuItem 
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer py-3 rounded-none gap-3 transition-colors px-4" 
                onClick={() => window.location.href = '/login'}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Terminate Session</span>
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