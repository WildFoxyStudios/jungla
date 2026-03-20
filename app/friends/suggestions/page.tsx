'use client';

import { useEffect, useState } from 'react';
import { friendsApi, FriendSuggestion } from '@/lib/api-friends';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, X } from 'lucide-react';
import Link from 'next/link';

export default function FriendSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const data = await friendsApi.getSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: string, suggestionId: string) => {
    try {
      await friendsApi.sendRequest(userId);
      setSuggestions(suggestions.filter((s) => s.id !== suggestionId));
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleDismiss = async (suggestionId: string) => {
    try {
      await friendsApi.dismissSuggestion(suggestionId);
      setSuggestions(suggestions.filter((s) => s.id !== suggestionId));
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  };

  const getReasonText = (reason: string) => {
    const reasons: Record<string, string> = {
      mutual_friends: 'Amigos en común',
      same_location: 'Misma ubicación',
      same_work: 'Mismo trabajo',
      same_school: 'Misma escuela',
    };
    return reasons[reason] || reason;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando sugerencias...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto py-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Personas que quizás conozcas</h1>

          {suggestions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No hay sugerencias en este momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="p-4">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3 overflow-hidden">
                      {suggestion.profile_picture_url ? (
                        <img
                          src={suggestion.profile_picture_url}
                          alt={suggestion.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-600">
                          {suggestion.full_name[0]}
                        </div>
                      )}
                    </div>

                    <Link href={`/profile/${suggestion.suggested_user_id}`}>
                      <h3 className="font-semibold hover:underline truncate">
                        {suggestion.full_name}
                      </h3>
                    </Link>

                    <div className="text-sm text-gray-600 my-2">
                      {suggestion.mutual_friends_count > 0 && (
                        <p>{suggestion.mutual_friends_count} amigos en común</p>
                      )}
                      <p className="text-xs text-gray-500">{getReasonText(suggestion.reason)}</p>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Button
                        onClick={() => handleAddFriend(suggestion.suggested_user_id, suggestion.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Agregar
                      </Button>
                      <Button
                        onClick={() => handleDismiss(suggestion.id)}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Quitar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
