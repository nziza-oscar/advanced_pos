'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Scan, Keyboard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUIStore, useModalStore } from '@/lib/store';
import { toast } from 'sonner';

export function SearchBar({
  onSearch,
  placeholder = 'Scan barcode or type name...',
  className = '',
}: { onSearch?: (q: string) => void, placeholder?: string, className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setSearchQuery, searchQuery } = useUIStore();
  const { openModal } = useModalStore();

  // Listen for Global Hardware Scanner
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      
      // Scanners are fast (< 30ms between keys)
      if (currentTime - lastKeyTime > 50) buffer = '';
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length > 2) {
          e.preventDefault();
          executeSearch(buffer);
          buffer = '';
        }
        return;
      }

      if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    const executeSearch = (query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
      toast.success(`Scanned: ${query}`, { icon: <Scan className="w-4 h-4" />, duration: 2000 });
      inputRef.current?.focus();
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onSearch, setSearchQuery]);

  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        ref={inputRef}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-20 h-12 bg-white rounded-xl border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
        {searchQuery && (
          <Button variant="ghost" size="icon" onClick={() => setSearchQuery('')} className="h-8 w-8 text-slate-400">
            <X className="w-4 h-4" />
          </Button>
        )}
        <Button 
          type="button" 
          variant="secondary" 
          size="sm" 
          onClick={() => openModal('scanner')} 
          className="h-8 px-2 bg-slate-100 hover:bg-slate-200"
        >
          <Scan className="w-4 h-4 mr-1" />
          Scan
        </Button>
      </div>
    </div>
  );
}