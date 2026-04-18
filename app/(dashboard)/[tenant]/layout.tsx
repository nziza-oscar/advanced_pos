// app/(dashboard)/[tenant]/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Tag,
  Truck,
  FileText,
  Bell,
  UserCircle,
  ChevronDown,
  Sun,
  Moon,
  CreditCard,
  Receipt,
  Database,
  Store
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface TenantData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: string;
}

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const tenantSlug = params.tenant as string;
  
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Navigation items based on user role (to be fetched from auth)
  const navigationItems = [
    {
      name: 'Dashboard',
      href: `/${tenantSlug}`,
      icon: LayoutDashboard,
      exact: true
    },
    {
      name: 'POS',
      href: `/${tenantSlug}/pos`,
      icon: ShoppingCart,
    },
    {
      name: 'Products',
      href: `/${tenantSlug}/products`,
      icon: Package,
    },
    {
      name: 'Categories',
      href: `/${tenantSlug}/categories`,
      icon: Tag,
    },
    {
      name: 'Inventory',
      href: `/${tenantSlug}/inventory`,
      icon: Database,
    },
    {
      name: 'Transactions',
      href: `/${tenantSlug}/transactions`,
      icon: Receipt,
    },
    {
      name: 'Customers',
      href: `/${tenantSlug}/customers`,
      icon: Users,
    },
    {
      name: 'Suppliers',
      href: `/${tenantSlug}/suppliers`,
      icon: Truck,
    },
    {
      name: 'Reports',
      href: `/${tenantSlug}/reports`,
      icon: BarChart3,
    },
    {
      name: 'Settings',
      href: `/${tenantSlug}/settings`,
      icon: Settings,
    },
  ];

  // Fetch tenant data
  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await fetch(`/api/tenants/slug/${tenantSlug}`);
        if (response.ok) {
          const data = await response.json();
          setTenant(data.data);
        } else {
          router.push('/404');
        }
      } catch (error) {
        console.error('Failed to fetch tenant:', error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    if (tenantSlug) {
      fetchTenant();
    }
  }, [tenantSlug, router]);

  // Check if link is active
  const isActive = (item: typeof navigationItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  // Handle logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <Link href={`/${tenantSlug}`} className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-8 w-8 rounded-lg" />
            ) : (
              <Store className="h-8 w-8 text-primary" />
            )}
            <div>
              <h1 className="font-bold text-lg text-foreground">{tenant.name}</h1>
              <p className="text-xs text-muted-foreground capitalize">{tenant.plan} Plan</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                  ${active 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            {/* Left side - Menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Right side - User menu */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-muted">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="h-5 w-5 text-primary" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b border-border">
                        <p className="font-medium text-foreground">John Doe</p>
                        <p className="text-xs text-muted-foreground">john@example.com</p>
                        <p className="text-xs text-primary mt-1 capitalize">Cashier</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href={`/${tenantSlug}/profile`}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <UserCircle className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          href={`/${tenantSlug}/settings`}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}