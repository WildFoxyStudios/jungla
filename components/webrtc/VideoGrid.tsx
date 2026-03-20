'use client';

import { useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

interface VideoGridProps {
  participants: Participant[];
  localStream?: MediaStream;
}

export default function VideoGrid({ participants, localStream }: VideoGridProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const gridCols = participants.length <= 1 ? 'grid-cols-1' : 
                   participants.length <= 4 ? 'grid-cols-2' : 
                   'grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-4 w-full h-full`}>
      {/* Local Video */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          Tú
        </div>
      </div>

      {/* Remote Videos */}
      {participants.map((participant) => (
        <ParticipantVideo key={participant.id} participant={participant} />
      ))}
    </div>
  );
}

function ParticipantVideo({ participant }: { participant: Participant }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
      {participant.videoEnabled && participant.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {participant.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
        {participant.name}
        {!participant.audioEnabled && <MicOff className="w-4 h-4" />}
      </div>
    </div>
  );
}
