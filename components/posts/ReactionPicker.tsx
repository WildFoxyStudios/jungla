'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';

interface ReactionPickerProps {
  onReact: (reactionType: string) => void;
  currentReaction?: string;
}

const reactions = [
  { type: 'like', emoji: '👍', label: 'Me gusta', color: 'text-blue-500' },
  { type: 'love', emoji: '❤️', label: 'Me encanta', color: 'text-red-500' },
  { type: 'haha', emoji: '😂', label: 'Me divierte', color: 'text-yellow-500' },
  { type: 'wow', emoji: '😮', label: 'Me asombra', color: 'text-orange-500' },
  { type: 'sad', emoji: '😢', label: 'Me entristece', color: 'text-blue-400' },
  { type: 'angry', emoji: '😠', label: 'Me enoja', color: 'text-red-600' },
  { type: 'care', emoji: '🤗', label: 'Me importa', color: 'text-pink-500' },
];

export default function ReactionPicker({ onReact, currentReaction }: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleReact = (type: string) => {
    onReact(type);
    setShowPicker(false);
  };

  const currentReactionData = reactions.find((r) => r.type === currentReaction);

  return (
    <div className="relative" ref={pickerRef}>
      <Button
        variant="ghost"
        size="sm"
        className={`flex-1 flex items-center justify-center gap-2 ${
          currentReaction ? currentReactionData?.color : ''
        }`}
        onMouseEnter={() => setShowPicker(true)}
        onClick={() => {
          if (currentReaction) {
            handleReact(currentReaction);
          } else {
            handleReact('like');
          }
        }}
      >
        {currentReaction ? (
          <>
            <span className="text-lg">{currentReactionData?.emoji}</span>
            <span className="font-medium">{currentReactionData?.label}</span>
          </>
        ) : (
          <>
            <ThumbsUp className="w-5 h-5" />
            <span className="font-medium">Me gusta</span>
          </>
        )}
      </Button>

      {/* Reaction Picker Popup */}
      {showPicker && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-full shadow-lg border px-2 py-1 flex gap-1 z-10 animate-in fade-in zoom-in-95 duration-200"
          onMouseLeave={() => setShowPicker(false)}
        >
          {reactions.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReact(reaction.type)}
              onMouseEnter={() => setHoveredReaction(reaction.type)}
              onMouseLeave={() => setHoveredReaction(null)}
              className={`
                relative p-1 rounded-full hover:bg-gray-100 transition-all duration-200
                ${hoveredReaction === reaction.type ? 'transform scale-150 -translate-y-2' : ''}
              `}
              title={reaction.label}
            >
              <span className="text-2xl block">{reaction.emoji}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {showPicker && hoveredReaction && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-16 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
          {reactions.find((r) => r.type === hoveredReaction)?.label}
        </div>
      )}
    </div>
  );
}
