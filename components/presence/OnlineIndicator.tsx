'use client';

import { useRealtime } from '@/contexts/RealtimeContext';

interface OnlineIndicatorProps {
  userId: string;
  showText?: boolean;
}

export default function OnlineIndicator({ userId, showText = false }: OnlineIndicatorProps) {
  const { onlineUsers } = useRealtime();
  const isOnline = onlineUsers.has(userId);

  if (!isOnline && !showText) return null;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
      {showText && (
        <span className="text-xs text-gray-600">
          {isOnline ? 'En línea' : 'Desconectado'}
        </span>
      )}
    </div>
  );
}
