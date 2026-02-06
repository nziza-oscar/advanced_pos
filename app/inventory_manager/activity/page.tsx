'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  User as UserIcon, 
  Package,
  Calendar,
  Loader2,
  ChevronLeft,
  StickyNote
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import Titles from '@/components/layout/Titles';

export default function RecentActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [range, setRange] = useState('day');
  const [loading, setLoading] = useState(true);

  const fetchActivity = async (selectedRange: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/activity?range=${selectedRange}`);
      const result = await res.json();
      if (result.success) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error("Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity(range);
  }, [range]);

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
         
          
          <Titles title='Recent Activity' description='History of stock adjustments and notes.'/>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'day', label: 'Last 24h' },
            { id: 'week', label: 'Weekly' },
            { id: 'month', label: 'Monthly' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRange(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                range === tab.id 
                ? 'bg-primary text-blue-200 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : activities.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {activities.map((log) => (
              <div key={log.id} className="p-5 hover:bg-slate-50 transition-colors flex items-start gap-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
                  log.type === 'in' 
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-red-50 text-red-600'
                }`}>
                  {log.type === 'in' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 truncate">{log.product}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      log.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.type === 'in' ? '+' : ''}{log.quantity} units
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                      <UserIcon className="w-3 h-3" />
                      {log.user}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                      <Calendar className="w-3 h-3" />
                      {log.reason || 'General'}
                    </div>
                  </div>

                  {log.notes && (
                    <div className="mt-2 flex items-start gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <StickyNote className="w-3 h-3 text-slate-400 mt-0.5" />
                      <p className="text-[11px] text-slate-600 font-medium italic">
                        {log.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                    <Clock className="w-3 h-3" />
                    {moment(log.timestamp).format("MM DD, HH:mm")}
                  </div>
                  <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
                    {moment(log.timestamp).format('MMM DD, HH:mm')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Package className="w-10 h-10 opacity-20" />
            <p className="text-sm font-medium">No activity found for this period.</p>
          </div>
        )}
      </div>
    </div>
  );
}