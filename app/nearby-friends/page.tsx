'use client';

import { useState, useEffect } from 'react';
import { friendsApi } from '@/lib/api-friends';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Users, Clock, ChevronRight, Search, Filter, Radio, Send } from 'lucide-react';
import Link from 'next/link';

interface NearbyFriend {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  distance: number; // in meters
  last_seen: string;
  is_active: boolean;
  location_name: string;
}

export default function NearbyFriendsPage() {
  const [nearbyFriends, setNearbyFriends] = useState<NearbyFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km default

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          loadNearbyFriends();
        },
        (error) => {
          console.error('Error getting location:', error);
          loadNearbyFriends(); // Load with mock data
        }
      );
    } else {
      loadNearbyFriends();
    }
  }, [searchRadius]);

  const loadNearbyFriends = async () => {
    try {
      setLoading(true);
      const friends = await friendsApi.getFriends({ limit: 20 });
      
      // Mock nearby friends data with distance calculations
      const nearby: NearbyFriend[] = friends.map((friend: any, idx: number) => ({
        ...friend,
        distance: [250, 800, 1200, 3500, 4800][idx % 5] || Math.floor(Math.random() * 5000),
        last_seen: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
        is_active: idx < 3,
        location_name: ['Café Starbucks', 'Parque Central', 'Centro Comercial', 'Gimnasio', 'Restaurante'][idx % 5],
      })).filter((f: NearbyFriend) => f.distance <= searchRadius);

      setNearbyFriends(nearby.sort((a: NearbyFriend, b: NearbyFriend) => a.distance - b.distance));
    } catch (error) {
      console.error('Error loading nearby friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 5) return 'Activo ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    return `Hace ${Math.floor(minutes / 60)}h`;
  };

  const activeFriends = nearbyFriends.filter(f => f.is_active);
  const nearbyList = nearbyFriends.filter(f => !f.is_active);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 px-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Amigos cercanos</h1>
            <p className="text-sm text-gray-600">Descubre qué amigos están cerca de ti</p>
          </div>
        </div>

        {/* Map Placeholder */}
        <Card className="mx-4 mb-4 overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Navigation className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                <p className="text-gray-600">Mapa de amigos cercanos</p>
                {userLocation && (
                  <p className="text-sm text-gray-500">
                    Tu ubicación: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Radius indicator */}
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Radio de búsqueda</span>
                <div className="flex gap-2">
                  {[1000, 5000, 10000].map(radius => (
                    <button
                      key={radius}
                      onClick={() => setSearchRadius(radius)}
                      className={`px-3 py-1 rounded text-sm ${
                        searchRadius === radius 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {radius / 1000}km
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex items-center justify-between mb-4 px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar amigos..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Active Now */}
        {activeFriends.length > 0 && (
          <div className="px-4 mb-6">
            <h2 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-green-500" />
              Activo ahora
              <span className="text-sm font-normal text-gray-500">({activeFriends.length})</span>
            </h2>
            <div className="space-y-2">
              {activeFriends.map(friend => (
                <Card key={friend.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {friend.full_name[0]}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <Link href={`/profile/${friend.id}`}>
                        <h3 className="font-semibold hover:underline">{friend.full_name}</h3>
                      </Link>
                      <p className="text-sm text-gray-500">{friend.location_name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600 font-medium">{formatDistance(friend.distance)}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-green-600">{formatLastSeen(friend.last_seen)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/messages?user=${friend.id}`}>
                        <Button size="sm" variant="outline">
                          <Send className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button size="sm">
                        Ver ubicación
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Friends List */}
        <div className="px-4">
          <h2 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            Amigos cerca
            <span className="text-sm font-normal text-gray-500">({nearbyList.length})</span>
          </h2>

          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Buscando amigos cercanos...</p>
            </Card>
          ) : nearbyList.length === 0 ? (
            <Card className="p-12 text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold mb-2">No hay amigos cercanos</h2>
              <p className="text-gray-600 mb-4">
                No se encontraron amigos dentro de {searchRadius / 1000}km de tu ubicación
              </p>
              <Button onClick={() => setSearchRadius(10000)}>
                Ampliar búsqueda a 10km
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {nearbyList.map(friend => (
                <Card key={friend.id} className="p-4 hover:shadow-md transition">
                  <Link href={`/profile/${friend.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {friend.full_name[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold hover:underline">{friend.full_name}</h3>
                        <p className="text-sm text-gray-500">{friend.location_name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium">{formatDistance(friend.distance)}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatLastSeen(friend.last_seen)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <Card className="mx-4 mt-6 p-4">
          <h3 className="font-semibold mb-2">Configuración de ubicación</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Compartir mi ubicación</span>
              <Button variant="outline" size="sm">Configurar</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Notificaciones de amigos cercanos</span>
              <Button variant="outline" size="sm">Activar</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
