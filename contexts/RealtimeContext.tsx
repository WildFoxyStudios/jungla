'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { wsClient, type RealtimeEvent, type NotificationEvent, type MessageEvent } from '@/lib/websocket';
import { useAuth } from './AuthContext';

interface RealtimeContextType {
  isConnected: boolean;
  notifications: NotificationEvent[];
  unreadCount: number;
  onlineUsers: Set<string>;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      wsClient.disconnect();
      setTimeout(() => setIsConnected(false), 0);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to WebSocket
    wsClient.connect(token);

    // Handle connection events
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    // Handle notifications
    const handleNotification = (event: RealtimeEvent) => {
      if (event.type === 'notification') {
        setNotifications(prev => [event as NotificationEvent, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(event.data.actor_name, {
            body: event.data.content,
            icon: event.data.actor_picture || '/icon.png',
          });
        }
      }
    };

    // Handle presence updates
    const handlePresence = (event: RealtimeEvent) => {
      if (event.type === 'presence') {
        const { user_id, status } = event.data;
        setOnlineUsers(prev => {
          const next = new Set(prev);
          if (status === 'online') {
            next.add(user_id);
          } else {
            next.delete(user_id);
          }
          return next;
        });
      }
    };

    wsClient.on('connected', handleConnected);
    wsClient.on('disconnected', handleDisconnected);
    wsClient.on('notification', handleNotification);
    wsClient.on('presence', handlePresence);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      wsClient.off('connected', handleConnected);
      wsClient.off('disconnected', handleDisconnected);
      wsClient.off('notification', handleNotification);
      wsClient.off('presence', handlePresence);
    };
  }, [user]);

  const sendTypingIndicator = (conversationId: string, isTyping: boolean) => {
    wsClient.send({
      type: 'typing',
      conversation_id: conversationId,
      is_typing: isTyping,
    });
  };

  const value: RealtimeContextType = {
    isConnected,
    notifications,
    unreadCount,
    onlineUsers,
    sendTypingIndicator,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}
