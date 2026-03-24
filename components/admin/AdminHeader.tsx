// components/admin/AdminHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, Menu, User, ChevronDown, X } from 'lucide-react';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search
    console.log('Searching:', searchQuery);
    setShowSearch(false);
  };

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Desktop search */}
            {!isMobile && (
              <div className="hidden md:block relative w-64 lg:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenants, users, transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            )}
          </div>
          
          {/* Right section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile search button */}
            {isMobile && (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 md:space-x-3 p-1 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">Super Admin</p>
                  <p className="text-xs text-gray-500">admin@pos.com</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>
              
              {/* Dropdown menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-20">
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors">
                      Profile
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors">
                      Settings
                    </button>
                    <hr className="my-1" />
                    <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors">
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile search modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="p-4 border-b flex items-center space-x-3">
            <button
              onClick={() => setShowSearch(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenants, users, transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500">Type to search...</p>
          </div>
        </div>
      )}
    </header>
  );
}