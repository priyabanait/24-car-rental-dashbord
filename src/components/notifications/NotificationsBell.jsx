import { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsBell() {
  const { notifications, unreadCount, markRead, markAllRead, clear } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  const onClickNotification = (n) => {
    markRead(n.id);
    // Optionally navigate to related entity using n.data
    // e.g., if n.data.bookingId -> navigate(`/bookings/${n.data.bookingId}`)
  };

  return (
    <div className="relative">
      <button onClick={handleOpen} className="p-2 rounded-md hover:bg-gray-100 relative">
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0 -right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="font-semibold">Notifications</div>
            <div className="flex items-center space-x-2">
              <button onClick={() => markAllRead()} className="text-sm text-gray-500 hover:text-gray-700">Mark all read</button>
              <button onClick={() => clear()} className="text-sm text-red-500 hover:text-red-700">Clear</button>
            </div>
          </div>
          <div className="max-h-64 overflow-auto">
            {notifications.length === 0 && (
              <div className="p-3 text-sm text-gray-500">No notifications</div>
            )}
            {notifications.map(n => (
              <div key={n.id} className={`px-3 py-2 border-b flex items-start gap-3 ${n.read ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="text-xs text-gray-400">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                  </div>
                  <div className="text-sm text-gray-700 mt-1">{n.message}</div>
                  <div className="mt-1 flex items-center gap-2">
                    {!n.read && <button onClick={() => onClickNotification(n)} className="text-xs text-success-600 flex items-center gap-1"><Check className="h-3 w-3"/>Mark read</button>}
                    <button onClick={() => { /* remove, mark as read */ markRead(n.id); }} className="text-xs text-gray-500 flex items-center gap-1"><X className="h-3 w-3"/>Dismiss</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
