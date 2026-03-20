'use client';

import { useEffect, useState } from 'react';
import { friendsApi, Friend, FriendStats } from '@/lib/api-friends';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Search } from 'lucide-react';
import Link from 'next/link';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [stats, setStats] = useState<FriendStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [friendsData, statsData] = await Promise.all([
        friendsApi.getFriends(),
        friendsApi.getStats(),
      ]);
      setFriends(friendsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const data = await friendsApi.getFriends({ search: searchQuery });
      setFriends(data);
    } catch (error) {
      console.error('Error searching friends:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando amigos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-4">
        <div className="grid grid-cols-4 gap-4">
          {/* Sidebar */}
          <div className="col-span-1">
            <Card className="p-4">
              <h2 className="font-bold text-xl mb-4">Amigos</h2>
              
              <Link href="/friends">
                <Button variant="ghost" className="w-full justify-start mb-2">
                  <Users className="w-5 h-5 mr-3" />
                  Todos los amigos
                  {stats && <span className="ml-auto">{stats.friends_count}</span>}
                </Button>
              </Link>

              <Link href="/friends/requests">
                <Button variant="ghost" className="w-full justify-start mb-2">
                  <UserPlus className="w-5 h-5 mr-3" />
                  Solicitudes
                  {stats && stats.pending_requests > 0 && (
                    <span className="ml-auto bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {stats.pending_requests}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/friends/suggestions">
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="w-5 h-5 mr-3" />
                  Sugerencias
                  {stats && <span className="ml-auto">{stats.suggestions_count}</span>}
                </Button>
              </Link>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-3">
            <Card className="p-4 mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar amigos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button onClick={handleSearch}>Buscar</Button>
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="font-bold text-xl mb-4">
                Amigos {stats && `(${stats.friends_count})`}
              </h2>

              {friends.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No tienes amigos aún</p>
                  <Link href="/friends/suggestions">
                    <Button className="mt-4">Ver sugerencias</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                          {friend.profile_picture_url ? (
                            <img
                              src={friend.profile_picture_url}
                              alt={friend.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600">
                              {friend.full_name[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/profile/${friend.id}`}>
                            <h3 className="font-semibold hover:underline truncate">
                              {friend.full_name}
                            </h3>
                          </Link>
                          {friend.mutual_friends_count > 0 && (
                            <p className="text-sm text-gray-600">
                              {friend.mutual_friends_count} amigos en común
                            </p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              Ver perfil
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              Mensaje
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
