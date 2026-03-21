'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, X } from 'lucide-react';

interface FriendSuggestion {
  id: string;
  username: string;
  full_name: string;
  mutual_friends: number;
  profile_picture?: string;
}

export default function FriendSuggestions() {
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    const mockSuggestions: FriendSuggestion[] = [
      {
        id: '1',
        username: 'maria.garcia',
        full_name: 'María García',
        mutual_friends: 12,
      },
      {
        id: '2',
        username: 'juan.perez',
        full_name: 'Juan Pérez',
        mutual_friends: 8,
      },
      {
        id: '3',
        username: 'ana.lopez',
        full_name: 'Ana López',
        mutual_friends: 15,
      },
    ];
    setSuggestions(mockSuggestions);
  };

  const addFriend = async (userId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== userId));
  };

  const removeSuggestion = (userId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== userId));
  };

  if (suggestions.length === 0) return null;

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-gray-700 mb-3">Personas que quizás conozcas</h3>
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{suggestion.full_name}</p>
              <p className="text-xs text-gray-500 mb-2">
                {suggestion.mutual_friends} amigos en común
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-8"
                  onClick={() => addFriend(suggestion.id)}
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Agregar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => removeSuggestion(suggestion.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
