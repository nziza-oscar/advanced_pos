'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateChange: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
  showPresets?: boolean;
  disabled?: boolean;
}

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'This month', days: null, custom: true },
  { label: 'Last month', days: null, custom: true },
  { label: 'Last 90 days', days: 90 },
  { label: 'Year to date', days: null, custom: true },
] as const;

export function DateRangePicker({
  dateRange,
  onDateChange,
  className,
  placeholder = 'Select date range',
  showPresets = true,
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handlePresetClick = (preset: typeof PRESETS[number]) => {
    const today = new Date();
    
    if (preset.custom) {
      let from: Date, to: Date;
      
      switch (preset.label) {
        case 'This month':
          from = new Date(today.getFullYear(), today.getMonth(), 1);
          to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case 'Last month':
          from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          to = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        case 'Year to date':
          from = new Date(today.getFullYear(), 0, 1);
          to = today;
          break;
        default:
          return;
      }
      
      onDateChange({ from, to });
    } else if (preset.days !== null) {
      const from = new Date(today);
      from.setDate(today.getDate() - preset.days);
      
      if (preset.days === 0) {
        // Today preset - set from to start of today, to to end of today
        from.setHours(0, 0, 0, 0);
        const to = new Date(today);
        to.setHours(23, 59, 59, 999);
        onDateChange({ from, to });
      } else if (preset.days === 1) {
        // Yesterday preset
        from.setHours(0, 0, 0, 0);
        const to = new Date(from);
        to.setHours(23, 59, 59, 999);
        onDateChange({ from, to });
      } else {
        // Last X days preset
        onDateChange({ from, to: today });
      }
    }
    
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(undefined);
    setIsOpen(false);
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      return placeholder;
    }
    
    if (range.from && range.to) {
      const fromDate = format(range.from, 'MMM d, yyyy');
      const toDate = format(range.to, 'MMM d, yyyy');
      
      // Check if it's the same day
      if (format(range.from, 'yyyy-MM-dd') === format(range.to, 'yyyy-MM-dd')) {
        return fromDate;
      }
      
      return `${fromDate} - ${toDate}`;
    }
    
    return format(range.from, 'MMM d, yyyy');
  };

  return (
    <div className={cn('relative', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full md:w-auto justify-between text-left font-normal bg-white hover:bg-slate-50 border-slate-200',
              'h-12 px-4 rounded-2xl shadow-sm transition-all duration-200',
              'hover:border-blue-300 hover:shadow-md focus:ring-2 focus:ring-blue-100 focus:border-blue-400',
              !dateRange && 'text-slate-400',
              isOpen && 'border-blue-400 ring-2 ring-blue-100 bg-blue-50'
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CalendarIcon className="h-4 w-4 text-slate-400" />
              <span className="truncate text-sm font-medium">
                {formatDateRange(dateRange)}
              </span>
            </div>
           <div className="flex items-center gap-1">
                {dateRange && (
                  <div
                    onClick={handleClear}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleClear(e as any);
                      }
                    }}
                  >
                    <X className="h-3 w-3 text-slate-400" />
                  </div>
                )}
                <ChevronDown className={cn(
                  'h-4 w-4 text-slate-400 transition-transform',
                  isOpen && 'rotate-180'
                )} />
              </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border-slate-200 shadow-xl rounded-2xl overflow-hidden"
          align="start"
        >
          <div className="flex flex-col md:flex-row">
            {showPresets && (
              <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                <div className="p-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">
                    Quick Select
                  </h4>
                  <div className="space-y-1">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-colors font-medium"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={onDateChange}
                numberOfMonths={2}
                className="border-0"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-semibold text-slate-900",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    "border border-slate-200 rounded-lg hover:bg-slate-100"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: cn(
                    "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
                    "flex items-center justify-center h-8"
                  ),
                  row: "flex w-full mt-2",
                  cell: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                    "[&:has([aria-selected])]:bg-blue-50",
                    "[&:has([aria-selected].day-outside)]:bg-blue-50/50",
                    "[&:has([aria-selected].day-range-end)]:rounded-r-md"
                  ),
                  day: cn(
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                    "hover:bg-blue-100 hover:text-blue-900 rounded-lg",
                    "flex items-center justify-center transition-colors"
                  ),
                  day_range_end: "day-range-end",
                  day_selected: cn(
                    "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
                    "focus:bg-blue-600 focus:text-white font-semibold"
                  ),
                  day_today: "bg-slate-100 text-slate-900 font-semibold",
                  day_outside: "text-slate-400 opacity-50",
                  day_disabled: "text-slate-300 opacity-50",
                  day_range_middle: cn(
                    "aria-selected:bg-blue-50 aria-selected:text-blue-900"
                  ),
                  day_hidden: "invisible",
                }}
                components={{
                  IconLeft: ({ ...props }) => (
                    <ChevronDown className="h-4 w-4 rotate-90" {...props} />
                  ),
                  IconRight: ({ ...props }) => (
                    <ChevronDown className="h-4 w-4 -rotate-90" {...props} />
                  ),
                }}
              />
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  {dateRange?.from && (
                    <span className="font-medium">
                      Selected: {formatDateRange(dateRange)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDateChange(undefined);
                      setIsOpen(false);
                    }}
                    className="rounded-lg h-8 px-3 text-xs font-medium"
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg h-8 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-700"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}