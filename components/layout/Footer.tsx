'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 px-10 bg-transparent border-t border-blue-50/50 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Copyright */}
        <p className="text-slate-400 text-sm font-medium">
          © {currentYear}  All rights reserved.
        </p>

        {/* Links */}
        <div className="flex items-center gap-8">
          <Link 
            href="/terms" 
            className="text-slate-400 hover:text-blue-500 text-sm font-semibold transition-colors"
          >
            Terms of Service
          </Link>
          <Link 
            href="/privacy" 
            className="text-slate-400 hover:text-blue-500 text-sm font-semibold transition-colors"
          >
            Privacy Policy
          </Link>
          <Link 
            href="/support" 
            className="text-slate-400 hover:text-blue-500 text-sm font-semibold transition-colors"
          >
            Support
          </Link>
        </div>

      </div>
    </footer>
  );
}