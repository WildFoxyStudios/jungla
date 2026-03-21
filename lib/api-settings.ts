import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface UserSettings {
  user_id: string;
  profile_visibility: 'public' | 'friends' | 'private';
  post_visibility: 'public' | 'friends' | 'private';
  allow_friend_requests: boolean;
  allow_messages: 'everyone' | 'friends' | 'nobody';
  allow_tags: boolean;
  show_online_status: boolean;
  show_last_seen: boolean;
  two_factor_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  dark_mode?: 'system' | 'light' | 'dark';
  reduce_brightness?: boolean;
  font_size?: 'small' | 'medium' | 'large';
  animations_enabled?: boolean;
  updated_at: string;
}

export interface UpdateSettingsRequest {
  profile_visibility?: 'public' | 'friends' | 'private';
  post_visibility?: 'public' | 'friends' | 'private';
  allow_friend_requests?: boolean;
  allow_messages?: 'everyone' | 'friends' | 'nobody';
  allow_tags?: boolean;
  show_online_status?: boolean;
  show_last_seen?: boolean;
  two_factor_enabled?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  dark_mode?: 'system' | 'light' | 'dark';
  reduce_brightness?: boolean;
  font_size?: 'small' | 'medium' | 'large';
  animations_enabled?: boolean;
}

export interface LoginSession {
  id: string;
  user_id: string;
  device_name: string;
  ip_address: string;
  user_agent: string;
  is_current: boolean;
  created_at: string;
  last_active: string;
}

export const settingsApi = {
  getSettings: async (token: string) => {
    const response = await axios.get<UserSettings>(
      `${API_URL}/settings`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  updateSettings: async (data: UpdateSettingsRequest, token: string) => {
    const response = await axios.put<UserSettings>(
      `${API_URL}/settings`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  getSessions: async (token: string) => {
    const response = await axios.get<LoginSession[]>(
      `${API_URL}/settings/sessions`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};
