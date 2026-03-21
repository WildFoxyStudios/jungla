import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Story {
  id: string;
  user_id: string;
  user_name?: string;
  user_picture?: string;
  media_url: string;
  media_type: string;
  text_content?: string;
  background_color?: string;
  created_at: string;
  expires_at: string;
  view_count?: number;
}

export interface CreateStoryRequest {
  media_url?: string;
  media_type?: string;
  text_content?: string;
  caption?: string;
  story_type?: string;
  background_color?: string;
  text_color?: string;
}

export const storyApi = {
  createStory: async (data: CreateStoryRequest, token: string) => {
    const response = await axios.post<Story>(
      `${API_URL}/stories`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  getActiveStories: async (token: string) => {
    const response = await axios.get<Story[]>(
      `${API_URL}/stories/active`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  viewStory: async (storyId: string, token: string) => {
    await axios.post(
      `${API_URL}/stories/${storyId}/view`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  deleteStory: async (storyId: string, token: string) => {
    await axios.delete(`${API_URL}/stories/${storyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};
