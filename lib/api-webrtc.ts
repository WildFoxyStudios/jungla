import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Call {
  id: string;
  caller_id: string;
  caller_name?: string;
  caller_picture?: string;
  receiver_id: string;
  receiver_name?: string;
  call_type: 'audio' | 'video';
  status: 'ringing' | 'ongoing' | 'ended' | 'missed' | 'rejected';
  started_at: string;
  ended_at?: string;
}

export interface SignalMessage {
  call_id: string;
  signal_type: 'offer' | 'answer' | 'ice_candidate';
  signal_data: any;
}

export const webrtcApi = {
  initiateCall: async (receiverId: string, callType: 'audio' | 'video', token: string) => {
    const response = await axios.post<Call>(
      `${API_URL}/webrtc/call`,
      { receiver_id: receiverId, call_type: callType },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  answerCall: async (callId: string, token: string) => {
    await axios.post(
      `${API_URL}/webrtc/call/${callId}/answer`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  rejectCall: async (callId: string, token: string) => {
    await axios.post(
      `${API_URL}/webrtc/call/${callId}/reject`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  endCall: async (callId: string, token: string) => {
    await axios.post(
      `${API_URL}/webrtc/call/${callId}/end`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  sendSignal: async (data: SignalMessage, token: string) => {
    await axios.post(
      `${API_URL}/webrtc/signal`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
};
