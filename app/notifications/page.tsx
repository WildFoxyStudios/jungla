'use client';

import { useState, useEffect } from 'react';
import { notificationApi, type Notification } from '@/lib/api-notifications';
import { Bell, Check, Trash2, Settings } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await notificationApi.getNotifications(token);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await notificationApi.markAsRead(notificationId, token);
      await loadNotifications();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await notificationApi.markAllAsRead(token);
      await loadNotifications();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await notificationApi.deleteNotification(notificationId, token);
      await loadNotifications();
    } catch (error) {
      console.error('Error:', error);
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
      case 'post_share':
        return `${notif.actor_name} compartió tu publicación`;
      case 'comment_like':
        return `A ${notif.actor_name} le gustó tu comentario`;
      case 'comment_reply':
        return `${notif.actor_name} respondió a tu comentario`;
      case 'tag_in_post':
        return `${notif.actor_name} te etiquetó en una publicación`;
      case 'event_invitation':
        return `${notif.actor_name} te invitó a un evento`;
      case 'group_invitation':
        return `${notif.actor_name} te invitó a un grupo`;
      default:
        return notif.content || 'Nueva notificación';
    }
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || !n.is_read
  );

  if (loading) {
    return <div className="p-8 text-center">Cargando notificaciones...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Notificaciones</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'unread' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              No leídas
            </button>
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Marcar todo como leído
            </button>
            <a
              href="/notifications/settings"
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configurar
            </a>
          </div>
        </div>

        <div className="divide-y">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No tienes notificaciones</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 hover:bg-gray-50 ${
                  !notif.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-4">
                  {notif.actor_picture && (
                    <img
                      src={notif.actor_picture}
                      alt={notif.actor_name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm mb-1">{getNotificationText(notif)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notif.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="p-2 hover:bg-gray-200 rounded-full"
                        title="Marcar como leído"
                      >
                        <Check className="w-5 h-5 text-blue-600" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-2 hover:bg-gray-200 rounded-full"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
