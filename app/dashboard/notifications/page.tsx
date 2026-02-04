'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/lib/store/notification-store';
import { Bell, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotificationStore();

  useEffect(() => { fetchNotifications(); }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-end mb-8 border-b border-muted pb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter">Alert Center</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Real-time system monitoring.</p>
        </div>
        <Button variant="outline" onClick={markAllAsRead} className="rounded-none text-xs font-bold uppercase h-10 px-6">
          Clear All
        </Button>
      </header>

      <div className="grid gap-1">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`flex items-start gap-6 p-6 border transition-all rounded-none ${
              n.is_read ? 'bg-background border-muted' : 'bg-primary/5 border-primary/20'
            }`}
          >
            <div className={n.is_read ? 'text-muted-foreground' : 'text-primary'}>
              <Bell size={18} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider">{n.title}</h3>
                <span className="text-[9px] text-muted-foreground uppercase flex items-center gap-1">
                  <Clock size={10} /> {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{n.message}</p>
              {!n.is_read && (
                <button 
                  onClick={() => markAsRead(n.id)}
                  className="mt-4 text-[9px] font-bold uppercase tracking-widest text-primary hover:underline"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}