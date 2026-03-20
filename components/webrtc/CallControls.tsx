'use client';

import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useState } from 'react';

interface CallControlsProps {
  onEndCall: () => void;
  onToggleMic: (enabled: boolean) => void;
  onToggleVideo: (enabled: boolean) => void;
  isVideoCall?: boolean;
}

export default function CallControls({
  onEndCall,
  onToggleMic,
  onToggleVideo,
  isVideoCall = true,
}: CallControlsProps) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const handleToggleMic = () => {
    const newState = !micEnabled;
    setMicEnabled(newState);
    onToggleMic(newState);
  };

  const handleToggleVideo = () => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    onToggleVideo(newState);
  };

  return (
    <div className="flex justify-center items-center gap-4 p-6 bg-gray-900/90 rounded-lg">
      {/* Mic Toggle */}
      <button
        onClick={handleToggleMic}
        className={`p-4 rounded-full transition ${
          micEnabled
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
        title={micEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
      >
        {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </button>

      {/* Video Toggle (only for video calls) */}
      {isVideoCall && (
        <button
          onClick={handleToggleVideo}
          className={`p-4 rounded-full transition ${
            videoEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={videoEnabled ? 'Desactivar cámara' : 'Activar cámara'}
        >
          {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>
      )}

      {/* End Call */}
      <button
        onClick={onEndCall}
        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
        title="Finalizar llamada"
      >
        <PhoneOff className="w-6 h-6" />
      </button>
    </div>
  );
}
