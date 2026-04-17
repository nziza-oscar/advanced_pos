'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 w-full",
        scrolled 
          ? "bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm" 
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className={cn(
          "flex w-full items-center justify-between transition-all duration-300",
          scrolled ? "py-3" : "py-5"
        )}>
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2.5">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <Logo className="h-9 w-9 text-indigo-500" />
              </div>
              <span className="text-xl font-semibold tracking-tight text-slate-800">
                OneManager
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full",
                    isActive
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            <Link href="/login">
              <Button 
                variant="ghost" 
                className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-indigo-600 text-sm font-medium text-white shadow-sm border-0 transition-all rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-3 text-base font-medium rounded-xl transition-colors",
                    pathname === item.href
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" className="w-full border-slate-200 text-slate-600 rounded-xl h-12">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl h-12 border-0">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}