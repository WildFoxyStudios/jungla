// WebSocket client para notificaciones y chat en tiempo real
import { API_URL } from './api';

export type NotificationEvent = {
  type: 'notification';
  data: {
    id: string;
    type: string;
    actor_id: string;
    actor_name: string;
    actor_picture?: string;
    content: string;
    created_at: string;
  };
};

export type MessageEvent = {
  type: 'message';
  data: {
    id: string;
    conversation_id: string;
    sender_id: string;
    sender_name: string;
    content: string;
    created_at: string;
  };
};

export type TypingEvent = {
  type: 'typing';
  data: {
    conversation_id: string;
    user_id: string;
    user_name: string;
    is_typing: boolean;
  };
};

export type PresenceEvent = {
  type: 'presence';
  data: {
    user_id: string;
    status: 'online' | 'offline' | 'away';
    last_seen?: string;
  };
};

export type RealtimeEvent = NotificationEvent | MessageEvent | TypingEvent | PresenceEvent;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(event: RealtimeEvent) => void>> = new Map();
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    const wsUrl = API_URL.replace('http', 'ws').replace('/api', '');
    
    try {
      this.ws = new WebSocket(`${wsUrl}/ws?token=${token}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', { type: 'presence', data: { user_id: '', status: 'online' } });
      };

      this.ws.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data);
          this.emit(data.type, data);
          this.emit('*', data); // Emit to all listeners
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', { type: 'error', data: error } as any);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected', { type: 'disconnected' } as any);
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.token) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        if (this.token) {
          this.connect(this.token);
        }
      }, delay);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.token = null;
      this.reconnectAttempts = 0;
    }
  }

  send(event: Record<string, unknown>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  on(eventType: string, callback: (event: RealtimeEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  off(eventType: string, callback: (event: RealtimeEvent) => void) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(eventType: string, event: RealtimeEvent) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();
