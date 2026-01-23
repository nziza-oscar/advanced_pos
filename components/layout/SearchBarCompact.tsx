'use client';

import { Search, Scan } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUIStore, useModalStore } from '@/lib/store';

interface SearchBarCompactProps {
  placeholder?: string;
}

export function SearchBarCompact({ placeholder = 'Search...' }: SearchBarCompactProps) {
  const { searchQuery, setSearchQuery } = useUIStore();
  const { openModal } = useModalStore();

  const handleScanClick = () => {
    openModal('scanner');
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-4"
        />
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={handleScanClick}
        title="Scan barcode"
      >
        <Scan className="w-4 h-4" />
      </Button>
    </div>
  );
}