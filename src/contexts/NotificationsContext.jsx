import { createContext, useContext, useState, useEffect } from 'react';

const NotificationsContext = createContext(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Try to fetch recent notifications from backend; fall back to localStorage
    const API_BASE = import.meta.env.VITE_API_BASE || 'https://24-car-rental-backend.vercel.app';
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/notifications?limit=100`);
        if (!res.ok) {
          console.warn('Notifications API responded with status', res.status);
        }
        const json = await res.json();
        if (json?.data) {
          const mapped = json.data.map(n => ({
            id: n._id,
            title: n.title || 'Notification',
            message: n.message || '',
            type: n.type || 'info',
            data: n.payload || {},
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
            read: !!n.read
          }));
          console.info('Fetched notifications from API:', mapped.length);
          setNotifications(mapped);
          return;
        }
      } catch (e) {
        console.warn('Failed to fetch notifications from API, falling back to localStorage', e);
      }

      const saved = localStorage.getItem('notifications');
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (e) {}
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (payload) => {
    const n = {
      id: payload.notificationId || payload.bookingId || `${Date.now()}-${Math.random()}`,
      title: payload.title || 'Notification',
      message: payload.message || '',
      type: payload.type || 'info',
      data: payload,
      createdAt: new Date(),
      read: false
    };
    setNotifications(prev => [n, ...prev].slice(0, 100)); // keep recent 100
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clear = () => setNotifications([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, markRead, markAllRead, clear, unreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}
