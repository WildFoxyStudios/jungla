'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, X } from 'lucide-react';

interface LiveStreamPlayerProps {
  streamId: string;
  streamUrl: string;
  streamerName: string;
  streamerPicture?: string;
  viewersCount: number;
  onClose: () => void;
}

export default function LiveStreamPlayer({
  streamId,
  streamUrl,
  streamerName,
  streamerPicture,
  viewersCount,
  onClose,
}: LiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  interface Comment {
    user_name: string;
    user_picture?: string;
    content: string;
  }
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [viewers, setViewers] = useState(viewersCount);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const cleanup = async () => {
    if (ws) {
      ws.close();
    }
    
    await fetch(`/api/streams/${streamId}/leave`, {
      method: 'POST',
      credentials: 'include',
    });
  };

  const initStream = async () => {
    // Conectar WebSocket para comentarios en tiempo real
    const websocket = new WebSocket(`ws://localhost:8080/api/streams/${streamId}/ws`);
    setWs(websocket);

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'comment') {
        setComments((prev) => [...prev, message.data]);
      } else if (message.type === 'viewers') {
        setViewers(message.count);
      }
    };

    // Cargar stream (HLS o WebRTC)
    if (videoRef.current) {
      // Opción 1: Si usas HLS
      if (streamUrl.endsWith('.m3u8')) {
        try {
          // Importar hls.js dinámicamente (opcional)
          const Hls = (await import('hls.js')).default;
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(videoRef.current);
          }
        } catch {
          // Si hls.js no está instalado, usar nativo
          videoRef.current.src = streamUrl;
        }
      } else {
        // Opción 2: WebRTC directo o video nativo
        videoRef.current.src = streamUrl;
      }
    }

    // Notificar que nos unimos
    await fetch(`/api/streams/${streamId}/join`, {
      method: 'POST',
      credentials: 'include',
    });
  };

  useEffect(() => {
    initStream();
    return () => { 
      cleanup().catch(console.error);
    };
  }, []);

  const sendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await fetch(`/api/streams/${streamId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newComment }),
      });
      setNewComment('');
    } catch (error) {
      console.error('Error enviando comentario:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      {/* Video principal */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          className="w-full h-full object-contain"
        />

        {/* Header del stream */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={streamerPicture || '/default-avatar.png'}
                alt={streamerName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="text-white font-semibold">{streamerName}</div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{viewers.toLocaleString()} viendo</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Live badge */}
        <div className="absolute top-20 left-4">
          <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
            🔴 EN VIVO
          </span>
        </div>
      </div>

      {/* Chat lateral */}
      <div className="w-96 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-white font-semibold">Chat en vivo</h3>
        </div>

        {/* Comentarios */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {comments.map((comment, idx) => (
            <div key={idx} className="flex gap-2">
              <img
                src={comment.user_picture || '/default-avatar.png'}
                alt={comment.user_name}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <div className="text-blue-400 text-sm font-semibold">
                  {comment.user_name}
                </div>
                <div className="text-white text-sm">{comment.content}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input de comentario */}
        <form onSubmit={sendComment} className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
