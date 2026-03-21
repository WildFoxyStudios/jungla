import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Event {
  id: string;
  name: string;
  description?: string;
  event_type: 'online' | 'in_person' | 'hybrid';
  start_time: string;
  end_time?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  cover_photo_url?: string;
  created_by: string;
  attendee_count?: number;
  created_at: string;
}

export interface CreateEventRequest {
  name: string;
  description?: string;
  event_type?: 'online' | 'in_person' | 'hybrid';
  start_time: string;
  end_time?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  privacy?: 'public' | 'private' | 'friends';
}

export interface EventAttendee {
  user_id: string;
  user_name: string;
  user_picture?: string;
  rsvp_status: 'going' | 'interested' | 'not_going';
}

export const eventApi = {
  createEvent: async (data: CreateEventRequest, token: string) => {
    const response = await axios.post<Event>(
      `${API_URL}/events`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  rsvpEvent: async (eventId: string, status: 'going' | 'interested' | 'not_going', token: string) => {
    await axios.post(
      `${API_URL}/events/${eventId}/rsvp`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  getEvent: async (eventId: string, token: string) => {
    const response = await axios.get<Event>(
      `${API_URL}/events/${eventId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  getUserEvents: async (token: string) => {
    const response = await axios.get<Event[]>(
      `${API_URL}/events/user`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};
