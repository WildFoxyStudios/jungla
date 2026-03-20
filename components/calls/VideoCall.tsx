'use client';

import { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

interface VideoCallProps {
  callId: string;
  userId: string;
  peerId: string;
  isInitiator: boolean;
  onEnd: () => void;
}

export default function VideoCall({ callId, userId, peerId, isInitiator, onEnd }: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);



  async function initCall() {
    try {
      // Obtener stream local (cámara y micrófono)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Configurar WebRTC peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      };
      
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      // Agregar tracks locales al peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Manejar stream remoto
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Conectar WebSocket para señalización
      const websocket = new WebSocket(`ws://localhost:8080/api/webrtc/signaling/${userId}`);
      setWs(websocket);

      websocket.addEventListener('open', () => {
        console.log('WebSocket conectado');
        if (isInitiator) {
          createOffer(pc, websocket);
        }
      });

      websocket.addEventListener('message', async (event) => {
        const message = JSON.parse(event.data);
        await handleSignalingMessage(message, pc, websocket);
      });

      // Manejar ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({
            type: 'ice-candidate',
            call_id: callId,
            from: userId,
            to: peerId,
            candidate: JSON.stringify(event.candidate),
          }));
        }
      };

    } catch (error) {
      console.error('Error iniciando llamada:', error);
      alert('No se pudo acceder a la cámara o micrófono');
    }
  };

  async function createOffer(pc: RTCPeerConnection, websocket: WebSocket) {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      websocket.send(JSON.stringify({
        type: 'offer',
        call_id: callId,
        from: userId,
        to: peerId,
        sdp: JSON.stringify(offer),
      }));
    } catch (error) {
      console.error('Error creando offer:', error);
    }
  };

  async function handleSignalingMessage(
    message: any,
    pc: RTCPeerConnection,
    websocket: WebSocket
  ) {
    try {
      switch (message.type) {
        case 'offer':
          const offer = JSON.parse(message.sdp);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          websocket.send(JSON.stringify({
            type: 'answer',
            call_id: callId,
            from: userId,
            to: peerId,
            sdp: JSON.stringify(answer),
          }));
          break;

        case 'answer':
          const answerDesc = JSON.parse(message.sdp);
          await pc.setRemoteDescription(new RTCSessionDescription(answerDesc));
          break;

        case 'ice-candidate':
          const candidate = JSON.parse(message.candidate);
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          break;
      }
    } catch (error) {
      console.error('Error manejando mensaje de señalización:', error);
    }
  };

  function toggleMute() {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  function toggleVideo() {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  function endCall() {
    cleanup();
    onEnd();
  };

  function cleanup() {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (ws) {
      ws.close();
    }
  };

  useEffect(() => {
    const t = setTimeout(() => initCall(), 0);
    return () => { clearTimeout(t); cleanup(); };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video remoto (pantalla completa) */}
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {!remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Esperando conexión...</p>
            </div>
          </div>
        )}
      </div>

      {/* Video local (miniatura) */}
      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover mirror"
        />
      </div>

      {/* Controles */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full ${
            isMuted ? 'bg-red-600' : 'bg-gray-700'
          } text-white hover:opacity-90 transition-all`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${
            isVideoOff ? 'bg-red-600' : 'bg-gray-700'
          } text-white hover:opacity-90 transition-all`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
