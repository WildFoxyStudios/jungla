'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, X } from 'lucide-react';
import { friendsApi, FriendSuggestion } from '@/lib/api-friends';

export default function FriendSuggestions() {
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const data = await friendsApi.getSuggestions();
      setSuggestions(data.slice(0, 3));
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async (userId: string) => {
    try {
      await friendsApi.sendRequest(userId);
      setSuggestions(prev => prev.filter(s => s.suggested_user_id !== userId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const removeSuggestion = async (suggestionId: string) => {
    try {
      await friendsApi.dismissSuggestion(suggestionId);
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Personas que quizás conozcas</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-gray-700 mb-3">Personas que quizás conozcas</h3>
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="flex items-start gap-3">
            {suggestion.profile_picture_url ? (
              <img 
                src={suggestion.profile_picture_url} 
                alt={suggestion.full_name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {suggestion.full_name[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{suggestion.full_name}</p>
              <p className="text-xs text-gray-500 mb-2">
                {suggestion.mutual_friends_count} amigos en común
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-8"
                  onClick={() => addFriend(suggestion.suggested_user_id)}
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
