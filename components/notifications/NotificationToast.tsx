'use client';

import { useEffect, useState } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { X, Bell } from 'lucide-react';
import type { NotificationEvent } from '@/lib/websocket';

export default function NotificationToast() {
  const { notifications } = useRealtime();
  const [visible, setVisible] = useState<NotificationEvent[]>([]);

  useEffect(() => {
    // Show last notification as toast
    if (notifications.length > 0) {
      const latest = notifications[0];
      setTimeout(() => {
        setVisible(prev => {
          // Avoid duplicates
          if (prev.some(n => n.data.id === latest.data.id)) {
            return prev;
          }
          return [latest, ...prev].slice(0, 3); // Max 3 toasts
        });
      }, 0);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setVisible(prev => prev.filter(n => n.data.id !== latest.data.id));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const dismiss = (id: string) => {
    setVisible(prev => prev.filter(n => n.data.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {visible.map((notification) => (
        <div
          key={notification.data.id}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in"
        >
          <div className="flex-shrink-0">
            {notification.data.actor_picture ? (
              <img
                src={notification.data.actor_picture}
                alt={notification.data.actor_name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {notification.data.actor_name}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              {notification.data.content}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Ahora mismo
            </p>
          </div>

          <button
            onClick={() => dismiss(notification.data.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
