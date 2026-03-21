import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Group {
  id: string;
  name: string;
  description?: string;
  privacy: 'public' | 'private' | 'secret';
  cover_photo_url?: string;
  member_count?: number;
  created_by: string;
  created_at: string;
}

export interface GroupPost {
  id: string;
  group_id: string;
  author_id: string;
  author_name?: string;
  author_picture?: string;
  content: string;
  media_urls?: string[];
  created_at: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  privacy?: 'public' | 'private' | 'secret';
}

export interface CreateGroupPostRequest {
  content: string;
  media_urls?: string[];
}

export const groupApi = {
  createGroup: async (data: CreateGroupRequest, token: string) => {
    const response = await axios.post<Group>(
      `${API_URL}/groups`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  joinGroup: async (groupId: string, token: string) => {
    await axios.post(
      `${API_URL}/groups/${groupId}/join`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  leaveGroup: async (groupId: string, token: string) => {
    await axios.delete(`${API_URL}/groups/${groupId}/leave`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  getGroupPosts: async (groupId: string, token: string) => {
    const response = await axios.get<GroupPost[]>(
      `${API_URL}/groups/${groupId}/posts`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  createGroupPost: async (groupId: string, data: CreateGroupPostRequest, token: string) => {
    const response = await axios.post<GroupPost>(
      `${API_URL}/groups/${groupId}/posts`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  getMyGroups: async (params?: { limit?: number; offset?: number }, token?: string) => {
    const sessionToken = token || localStorage.getItem('session_token');
    const response = await axios.get<Group[]>(
      `${API_URL}/groups/my`,
      { 
        headers: { Authorization: `Bearer ${sessionToken}` },
        params
      }
    );
    return response.data;
  },

  getGroup: async (groupId: string, token?: string) => {
    const sessionToken = token || localStorage.getItem('session_token');
    const response = await axios.get<Group>(
      `${API_URL}/groups/${groupId}`,
      { headers: { Authorization: `Bearer ${sessionToken}` } }
    );
    return response.data;
  },

  searchGroups: async (query: string, token?: string) => {
    const sessionToken = token || localStorage.getItem('session_token');
    const response = await axios.get<Group[]>(
      `${API_URL}/groups/search`,
      { 
        headers: { Authorization: `Bearer ${sessionToken}` },
        params: { q: query }
      }
    );
    return response.data;
  },
};
