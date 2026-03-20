import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface LiveStream {
  id: string;
  streamer_id: string;
  streamer_name?: string;
  streamer_picture?: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  stream_key?: string;
  status: 'scheduled' | 'live' | 'ended';
  viewer_count?: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

export interface StreamComment {
  id: string;
  stream_id: string;
  user_id: string;
  user_name?: string;
  user_picture?: string;
  content: string;
  created_at: string;
}

export const streamingApi = {
  createStream: async (title: string, description?: string, token?: string) => {
    const response = await axios.post<LiveStream>(
      `${API_URL}/streaming/streams`,
      { title, description },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return response.data;
  },

  startStream: async (streamId: string, token: string) => {
    await axios.post(
      `${API_URL}/streaming/streams/${streamId}/start`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  endStream: async (streamId: string, token: string) => {
    await axios.post(
      `${API_URL}/streaming/streams/${streamId}/end`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  getLiveStreams: async (token?: string) => {
    const response = await axios.get<LiveStream[]>(
      `${API_URL}/streaming/live`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return response.data;
  },

  joinStream: async (streamId: string, token: string) => {
    await axios.post(
      `${API_URL}/streaming/streams/${streamId}/join`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  leaveStream: async (streamId: string, token: string) => {
    await axios.post(
      `${API_URL}/streaming/streams/${streamId}/leave`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  postComment: async (streamId: string, content: string, token: string) => {
    const response = await axios.post<StreamComment>(
      `${API_URL}/streaming/streams/${streamId}/comments`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  getComments: async (streamId: string, token?: string) => {
    const response = await axios.get<StreamComment[]>(
      `${API_URL}/streaming/streams/${streamId}/comments`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return response.data;
  },
};
