'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Scan } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUIStore, useModalStore } from '@/lib/store';

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  showScanButton?: boolean;
}

export function SearchBar({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'Search products...',
  className = '',
  autoFocus = false,
  showScanButton = true,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { setSearchQuery, searchQuery } = useUIStore();
  const { openModal } = useModalStore();

  // Use controlled value if provided, otherwise use store value
  const value = controlledValue !== undefined ? controlledValue : searchQuery;

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (onChange) {
      onChange(newValue);
    } else {
      setSearchQuery(newValue);
    }
    
    setLocalValue(newValue);
  };

  // Handle search submit
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const query = value.trim();
    if (onSearch) {
      onSearch(query);
    }
    
    // Blur input on mobile
    if (window.innerWidth < 768) {
      inputRef.current?.blur();
    }
  };

  // Clear search
  const handleClear = () => {
    if (onChange) {
      onChange('');
    } else {
      setSearchQuery('');
    }
    setLocalValue('');
    inputRef.current?.focus();
  };

  // Open barcode scanner
  const handleScanClick = () => {
    openModal('scanner');
  };

  // Listen for scanner keyboard input (rapid entry + Enter)
  useEffect(() => {
    let inputBuffer = '';
    let lastKeyTime = Date.now();
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only listen if search bar is focused or no input is focused
      const activeElement = document.activeElement;
      const isSearchFocused = activeElement === inputRef.current;
      
      if (!isSearchFocused && activeElement?.tagName === 'INPUT') {
        return; // Another input is focused, let it handle keys
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      
      // Reset buffer if too much time passed (not a scanner)
      if (timeDiff > 100) {
        inputBuffer = '';
      }
      
      lastKeyTime = currentTime;
      
      // If Enter is pressed, process the barcode
      if (event.key === 'Enter' && inputBuffer.length > 0) {
        event.preventDefault();
        
        // Focus search bar and set value
        inputRef.current?.focus();
        const searchValue = inputBuffer.trim();
        
        if (onChange) {
          onChange(searchValue);
        } else {
          setSearchQuery(searchValue);
        }
        
        setLocalValue(searchValue);
        inputBuffer = '';
        
        // Trigger search
        if (onSearch) {
          onSearch(searchValue);
        }
        
        return;
      }
      
      // Collect alphanumeric characters
      if (event.key.length === 1 && 
          !event.ctrlKey && 
          !event.altKey && 
          !event.metaKey) {
        inputBuffer += event.key;
        
        // Auto-focus search bar when scanner starts typing
        if (inputBuffer.length === 1) {
          inputRef.current?.focus();
        }
        
        // Auto-process if buffer gets too long
        if (inputBuffer.length > 13) {
          if (onChange) {
            onChange(inputBuffer);
          } else {
            setSearchQuery(inputBuffer);
          }
          
          setLocalValue(inputBuffer);
          
          if (onSearch) {
            onSearch(inputBuffer);
          }
          
          inputBuffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onChange, onSearch, setSearchQuery]);

  return (
    <form 
      onSubmit={handleSearch}
      className={`relative ${className}`}
    >
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>

        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            pl-10 pr-24
            ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}
            transition-all duration-200
          `}
          autoFocus={autoFocus}
          aria-label="Search products"
        />

        {/* Clear Button (when text exists) */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Scan Button */}
          {showScanButton && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleScanClick}
              className="h-8 px-2"
              title="Scan barcode"
            >
              <Scan className="w-4 h-4" />
            </Button>
          )}

          {/* Search Button */}
          <Button
            type="submit"
            size="sm"
            className="h-8 px-3"
            disabled={!value.trim()}
          >
            Search
          </Button>
        </div>
      </div>

      {/* Quick Tips */}
      {!value && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-4">
          <span>Press Enter to search</span>
          {showScanButton && (
            <span className="flex items-center gap-1">
              <Scan className="w-3 h-3" />
              Click scan or start typing to scan barcode
            </span>
          )}
        </div>
      )}
    </form>
  );
}