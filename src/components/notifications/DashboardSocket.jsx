import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';

export default function DashboardSocket() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'https://24-car-rental-backend.vercel.app';
    const token = user?.token;

    // Connect with optional auth token (server can choose to validate or ignore)
    const socket = io(API_BASE, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Dashboard socket connected', socket.id);
      socket.emit('joinDashboard');
    });

    socket.on('dashboard_notification', (payload) => {
      if (!payload) return;
      const title = payload.title || 'Notification';
      const message = payload.message || JSON.stringify(payload);

      // Show toast notification
      toast.custom((t) => (
        <div className="p-3 bg-white rounded shadow-md border">
          <div className="font-semibold">{title}</div>
          <div className="text-sm">{message}</div>
        </div>
      ));

      // Add to notifications context (for bell)
      try {
        addNotification(payload);
      } catch (e) {
        console.warn('Failed to add notification to context', e);
      }

      console.log('Dashboard notification received:', payload);
    });

    socket.on('disconnect', (reason) => {
      console.log('Dashboard socket disconnected:', reason);
    });

    return () => {
      try {
        socket.emit('leaveDashboard');
      } catch (e) {}
      socket.disconnect();
    };
  }, [user]);

  return null;
}
