import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  actor_id?: string;
  actor_name?: string;
  actor_picture?: string;
  target_type?: string;
  target_id?: string;
  content?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationStats {
  total_count: number;
  unread_count: number;
}

export interface NotificationPreferences {
  friend_requests: boolean;
  messages: boolean;
  comments: boolean;
  likes: boolean;
  tags: boolean;
  events: boolean;
  groups: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export const notificationApi = {
  getNotifications: async (token: string) => {
    const response = await axios.get<Notification[]>(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getStats: async (token: string) => {
    const response = await axios.get<NotificationStats>(`${API_URL}/notifications/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  markAsRead: async (notificationId: string, token: string) => {
    await axios.post(`${API_URL}/notifications/${notificationId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  markAllAsRead: async (token: string) => {
    await axios.post(`${API_URL}/notifications/read-all`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  deleteNotification: async (notificationId: string, token: string) => {
    await axios.delete(`${API_URL}/notifications/${notificationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  getPreferences: async (token: string) => {
    const response = await axios.get<NotificationPreferences>(`${API_URL}/notifications/preferences`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updatePreferences: async (preferences: Partial<NotificationPreferences>, token: string) => {
    const response = await axios.put<NotificationPreferences>(
      `${API_URL}/notifications/preferences`,
      preferences,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};
