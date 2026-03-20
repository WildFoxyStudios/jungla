'use client';

import { useState, useEffect } from 'react';
import { messageApi, type Conversation, type Message } from '@/lib/api-messages';
import { Send, Image as ImageIcon, Smile, MoreVertical, Search } from 'lucide-react';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id);
    }
  }, [selectedConv]);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await messageApi.getConversations(token);
      setConversations(data);
      if (data.length > 0 && !selectedConv) {
        setSelectedConv(data[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await messageApi.getMessages(conversationId, token);
      setMessages(data);
      await messageApi.markAsRead(conversationId, token);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConv) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await messageApi.sendMessage(selectedConv.id, {
        content: messageText,
        message_type: 'text'
      }, token);

      setMessageText('');
      await loadMessages(selectedConv.id);
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando mensajes...</div>;
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar - Lista de conversaciones */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold mb-3">Chats</h2>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en chats..."
              className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tienes conversaciones
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                  selectedConv?.id === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    {conv.name?.charAt(0) || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="font-semibold truncate">
                        {conv.name || 'Conversación'}
                      </h3>
                      {conv.last_message_at && (
                        <span className="text-xs text-gray-500">
                          {new Date(conv.last_message_at).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conv.last_message || 'Sin mensajes'}
                    </p>
                  </div>
                  {conv.unread_count && conv.unread_count > 0 && (
                    <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unread_count}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConv ? (
          <>
            {/* Header del chat */}
            <div className="bg-white border-b p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {selectedConv.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedConv.name || 'Conversación'}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedConv.is_group 
                      ? `${selectedConv.participants?.length || 0} participantes`
                      : 'Activo'}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === localStorage.getItem('userId');
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                      {!isOwn && (
                        <p className="text-xs text-gray-500 mb-1 ml-2">
                          {msg.sender_name}
                        </p>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border'
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-2">
                        {new Date(msg.created_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input de mensaje */}
            <form onSubmit={handleSendMessage} className="bg-white border-t p-4">
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Smile className="w-6 h-6 text-gray-600" />
                </button>
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecciona una conversación para empezar
          </div>
        )}
      </div>
    </div>
  );
}
