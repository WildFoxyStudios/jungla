import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Conversation {
  id: string;
  name?: string;
  is_group: boolean;
  created_by: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  participants?: ConversationParticipant[];
  created_at: string;
}

export interface ConversationParticipant {
  user_id: string;
  user_name: string;
  user_picture?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string;
  sender_picture?: string;
  content?: string;
  message_type: string;
  media_url?: string;
  reply_to_id?: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateConversationRequest {
  participant_ids: string[];
  is_group?: boolean;
  name?: string;
}

export interface SendMessageRequest {
  content?: string;
  message_type?: string;
  media_url?: string;
  reply_to_id?: string;
}

export const messageApi = {
  createConversation: async (data: CreateConversationRequest, token: string) => {
    const response = await axios.post<Conversation>(
      `${API_URL}/messages/conversations`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  getConversations: async (token: string) => {
    const response = await axios.get<Conversation[]>(
      `${API_URL}/messages/conversations`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  getMessages: async (conversationId: string, token: string) => {
    const response = await axios.get<Message[]>(
      `${API_URL}/messages/conversations/${conversationId}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  sendMessage: async (conversationId: string, data: SendMessageRequest, token: string) => {
    const response = await axios.post<Message>(
      `${API_URL}/messages/conversations/${conversationId}/messages`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  markAsRead: async (conversationId: string, token: string) => {
    await axios.post(
      `${API_URL}/messages/conversations/${conversationId}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  deleteMessage: async (messageId: string, token: string) => {
    await axios.delete(`${API_URL}/messages/${messageId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};
