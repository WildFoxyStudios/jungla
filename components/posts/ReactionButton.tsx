'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import { REACTION_TYPES, ReactionType } from '@/lib/constants';

interface ReactionButtonProps {
  onReact?: (reactionType: string) => void;
  currentReaction?: ReactionType;
}

export default function ReactionButton({ onReact, currentReaction }: ReactionButtonProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReact = (type: ReactionType) => {
    onReact?.(type);
    setShowPicker(false);
  };

  return (
    <div className="relative flex-1">
      <Button
        variant="ghost"
        size="sm"
        className="w-full flex items-center justify-center gap-2"
        onMouseEnter={() => setShowPicker(true)}
        onMouseLeave={() => setShowPicker(false)}
        onClick={() => handleReact('like')}
      >
        {currentReaction ? (
          <>
            <span className="text-lg">{REACTION_TYPES[currentReaction].emoji}</span>
            <span className="font-medium text-blue-600">{REACTION_TYPES[currentReaction].label}</span>
          </>
        ) : (
          <>
            <ThumbsUp className="w-5 h-5" />
            <span className="font-medium">Me gusta</span>
          </>
        )}
      </Button>

      {showPicker && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-full shadow-lg px-2 py-2 flex gap-1 z-50"
          onMouseEnter={() => setShowPicker(true)}
          onMouseLeave={() => setShowPicker(false)}
        >
          {(Object.keys(REACTION_TYPES) as ReactionType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleReact(type)}
              className="hover:scale-125 transition-transform p-1"
              title={REACTION_TYPES[type].label}
            >
              <span className="text-2xl">{REACTION_TYPES[type].emoji}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
