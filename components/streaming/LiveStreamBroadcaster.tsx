'use client';

import { useEffect, useRef, useState } from 'react';
import { Video, Mic, MicOff, VideoOff, StopCircle, Eye } from 'lucide-react';

interface LiveStreamBroadcasterProps {
  streamId: string;
  onEnd: () => void;
}

interface StreamComment {
  user_name: string;
  content: string;
}

export default function LiveStreamBroadcaster({
  streamId,
  onEnd,
}: LiveStreamBroadcasterProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [comments, setComments] = useState<StreamComment[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const initBroadcast = async () => {
    try {
      // Obtener stream local
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      setLocalStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Conectar WebSocket para señalización
      const ws = new WebSocket(`ws://localhost:8080/api/streams/${streamId}/broadcast`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'viewers') {
          setViewers(message.count);
        } else if (message.type === 'comment') {
          setComments((prev) => [...prev, message.data].slice(-50));
        }
      };

    } catch (error) {
      console.error('Error iniciando broadcast:', error);
      alert('No se pudo acceder a la cámara o micrófono');
    }
  };

  const startStreaming = async () => {
    if (!localStream) return;

    try {
      // Opción 1: WebRTC con MediaRecorder para streaming al servidor
      const mediaRecorder = new MediaRecorder(localStream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Enviar chunks de video al servidor
          const reader = new FileReader();
          reader.onload = () => {
            wsRef.current?.send(reader.result as ArrayBuffer);
          };
          reader.readAsArrayBuffer(event.data);
        }
      };

      // Enviar chunks cada 100ms para baja latencia
      mediaRecorder.start(100);

      // Notificar al backend que empezamos
      await fetch(`/api/streams/${streamId}/start`, {
        method: 'POST',
        credentials: 'include',
      });

      setIsStreaming(true);

    } catch (error) {
      console.error('Error iniciando streaming:', error);
      alert('Error al iniciar la transmisión');
    }
  };

  const stopStreaming = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    await fetch(`/api/streams/${streamId}/end`, {
      method: 'POST',
      credentials: 'include',
    });

    setIsStreaming(false);
    onEnd();
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => initBroadcast(), 0);
    return () => { clearTimeout(t); cleanup(); };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      {/* Vista previa del streamer */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-contain mirror"
        />

        {/* Overlay de información */}
        <div className="absolute top-4 left-4 space-y-2">
          {isStreaming && (
            <div className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold">EN VIVO</span>
            </div>
          )}
          
          <div className="bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{viewers} espectadores</span>
          </div>
        </div>

        {/* Controles */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
          {!isStreaming ? (
            <button
              onClick={startStreaming}
              className="px-8 py-4 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition"
            >
              Comenzar Transmisión
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full ${
                  isMuted ? 'bg-red-600' : 'bg-gray-700'
                } text-white hover:opacity-90`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full ${
                  isVideoOff ? 'bg-red-600' : 'bg-gray-700'
                } text-white hover:opacity-90`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>

              <button
                onClick={stopStreaming}
                className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                <StopCircle className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chat en vivo */}
      <div className="w-96 bg-gray-900 p-4 overflow-y-auto">
        <h3 className="text-white font-semibold mb-4">Comentarios en vivo</h3>
        <div className="space-y-3">
          {comments.map((comment, idx) => (
            <div key={idx} className="bg-gray-800 p-3 rounded-lg">
              <div className="text-blue-400 font-semibold text-sm">
                {comment.user_name}
              </div>
              <div className="text-white text-sm">{comment.content}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
