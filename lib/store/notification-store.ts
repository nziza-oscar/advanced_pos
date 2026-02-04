import { create } from 'zustand';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'low_stock' | 'sale' | 'system' | 'alert';
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json.success) {
        const unread = json.data.filter((n: Notification) => !n.is_read).length;
        set({ notifications: json.data, unreadCount: unread });
      }
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ id }),
    });
    // Optimistic update
    const updated = get().notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    );
    set({ 
      notifications: updated, 
      unreadCount: updated.filter(n => !n.is_read).length 
    });
  },

  markAllAsRead: async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ markAllAsRead: true }),
    });
    const updated = get().notifications.map(n => ({ ...n, is_read: true }));
    set({ notifications: updated, unreadCount: 0 });
  },
}));