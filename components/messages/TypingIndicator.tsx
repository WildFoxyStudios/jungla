'use client';

import { useEffect, useState } from 'react';
import { wsClient } from '@/lib/websocket';

interface TypingIndicatorProps {
  conversationId: string;
}

export default function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleTyping = (event: any) => {
      if (event.type === 'typing' && event.data.conversation_id === conversationId) {
        const { user_name, is_typing } = event.data;
        
        setTypingUsers(prev => {
          const next = new Set(prev);
          if (is_typing) {
            next.add(user_name);
          } else {
            next.delete(user_name);
          }
          return next;
        });

        // Auto-clear after 3 seconds
        if (is_typing) {
          setTimeout(() => {
            setTypingUsers(prev => {
              const next = new Set(prev);
              next.delete(user_name);
              return next;
            });
          }, 3000);
        }
      }
    };

    wsClient.on('typing', handleTyping);
    return () => wsClient.off('typing', handleTyping);
  }, [conversationId]);

  if (typingUsers.size === 0) return null;

  const names = Array.from(typingUsers);
  const text = names.length === 1 
    ? `${names[0]} está escribiendo...`
    : `${names.join(', ')} están escribiendo...`;

  return (
    <div className="px-4 py-2 text-sm text-gray-500 italic">
      {text}
      <span className="ml-1 inline-flex gap-1">
        <span className="animate-bounce">.</span>
        <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
      </span>
    </div>
  );
}
