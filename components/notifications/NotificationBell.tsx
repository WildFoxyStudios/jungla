'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationApi, type Notification } from '@/lib/api-notifications';
import { useRealtime } from '@/contexts/RealtimeContext';

export default function NotificationBell() {
  const { unreadCount: realtimeUnreadCount } = useRealtime();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);



  async function loadNotifications() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [notifs, stats] = await Promise.all([
        notificationApi.getNotifications(token),
        notificationApi.getStats(token)
      ]);

      setNotifications(notifs.slice(0, 5)); // Latest 5
      setUnreadCount(stats.unread_count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Sync with realtime unread count


  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await notificationApi.markAsRead(notificationId, token);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationText = (notif: Notification) => {
    switch (notif.notification_type) {
      case 'friend_request':
        return `${notif.actor_name} te envió una solicitud de amistad`;
      case 'friend_accept':
        return `${notif.actor_name} aceptó tu solicitud de amistad`;
      case 'post_like':
        return `A ${notif.actor_name} le gustó tu publicación`;
      case 'post_comment':
        return `${notif.actor_name} comentó en tu publicación`;
      case 'comment_reply':
        return `${notif.actor_name} respondió a tu comentario`;
      default:
        return notif.content || 'Nueva notificación';
    }
  };

  // Sync with realtime unread count — use setTimeout to avoid synchronous cascading renders
  useEffect(() => {
    if (realtimeUnreadCount > 0) {
      const t = setTimeout(() => setUnreadCount(realtimeUnreadCount), 0);
      return () => clearTimeout(t);
    }
  }, [realtimeUnreadCount]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || cancelled) return;

        const [notifs, stats] = await Promise.all([
          notificationApi.getNotifications(token),
          notificationApi.getStats(token)
        ]);

        if (!cancelled) {
          setNotifications(notifs.slice(0, 5));
          setUnreadCount(stats.unread_count);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg">Notificaciones</h3>
            <button
              onClick={async () => {
                const token = localStorage.getItem('token');
                if (token) {
                  await notificationApi.markAllAsRead(token);
                  await loadNotifications();
                }
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Marcar todo como leído
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notif.is_read ? 'bg-blue-50' : ''
                    }`}
                >
                  <div className="flex gap-3">
                    {notif.actor_picture && (
                      <img
                        src={notif.actor_picture}
                        alt={notif.actor_name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{getNotificationText(notif)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t text-center">
            <a href="/notifications" className="text-sm text-blue-600 hover:underline">
              Ver todas las notificaciones
            </a>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
