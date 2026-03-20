import { api } from './api';

export interface Friend {
  id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  mutual_friends_count: number;
  friendship_id: string;
  friendship_status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
}

export interface FriendSuggestion {
  id: string;
  suggested_user_id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  reason: string;
  mutual_friends_count: number;
  score: number;
}

export interface FriendStats {
  pending_requests: number;
  friends_count: number;
  suggestions_count: number;
}

export interface FriendList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  members_count: number;
  created_at: string;
}

export const friendsApi = {
  async getFriends(params?: { limit?: number; offset?: number; search?: string }): Promise<Friend[]> {
    const response = await api.get('/friends', { params });
    return response.data;
  },

  async getFriendRequests(): Promise<Friend[]> {
    const response = await api.get('/friends/requests');
    return response.data;
  },

  async getSuggestions(): Promise<FriendSuggestion[]> {
    const response = await api.get('/friends/suggestions');
    return response.data;
  },

  async getStats(): Promise<FriendStats> {
    const response = await api.get('/friends/stats');
    return response.data;
  },

  async sendRequest(friendId: string): Promise<void> {
    await api.post(`/friends/request/${friendId}`);
  },

  async acceptRequest(friendshipId: string): Promise<void> {
    await api.post(`/friends/accept/${friendshipId}`);
  },

  async rejectRequest(friendshipId: string): Promise<void> {
    await api.post(`/friends/reject/${friendshipId}`);
  },

  async unfriend(friendId: string): Promise<void> {
    await api.delete(`/friends/unfriend/${friendId}`);
  },

  async blockUser(userId: string): Promise<void> {
    await api.post(`/friends/block/${userId}`);
  },

  async unblockUser(userId: string): Promise<void> {
    await api.post(`/friends/unblock/${userId}`);
  },

  async dismissSuggestion(suggestionId: string): Promise<void> {
    await api.post(`/friends/suggestions/${suggestionId}/dismiss`);
  },

  async getFriendLists(): Promise<FriendList[]> {
    const response = await api.get('/friends/lists');
    return response.data;
  },

  async createFriendList(data: { name: string; description?: string }): Promise<FriendList> {
    const response = await api.post('/friends/lists', data);
    return response.data;
  },

  async deleteFriendList(listId: string): Promise<void> {
    await api.delete(`/friends/lists/${listId}`);
  },

  async addToList(listId: string, friendIds: string[]): Promise<void> {
    await api.post(`/friends/lists/${listId}/add`, { friend_ids: friendIds });
  },
};
