'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Play, Trophy, Users, Star, Clock, TrendingUp, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  cover_image: string;
  rating: number;
  players_count: number;
  is_featured?: boolean;
  is_multiplayer?: boolean;
}

export default function GamingPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Todo', icon: Gamepad2 },
    { id: 'action', label: 'Acción', icon: Trophy },
    { id: 'puzzle', label: 'Puzzle', icon: Star },
    { id: 'multiplayer', label: 'Multijugador', icon: Users },
    { id: 'casual', label: 'Casual', icon: Clock },
  ];

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      // Mock games data - in production this would come from an API
      const mockGames: Game[] = [
        {
          id: '1',
          name: 'Candy Crush Saga',
          description: 'El juego de puzzle más popular del mundo',
          category: 'puzzle',
          cover_image: '/api/placeholder/300/200',
          rating: 4.8,
          players_count: 2500000,
          is_featured: true,
          is_multiplayer: false,
        },
        {
          id: '2',
          name: '8 Ball Pool',
          description: 'El mejor juego de billar multijugador',
          category: 'multiplayer',
          cover_image: '/api/placeholder/300/200',
          rating: 4.6,
          players_count: 1800000,
          is_featured: true,
          is_multiplayer: true,
        },
        {
          id: '3',
          name: 'Solitaire',
          description: 'El clásico juego de cartas',
          category: 'casual',
          cover_image: '/api/placeholder/300/200',
          rating: 4.4,
          players_count: 900000,
          is_multiplayer: false,
        },
        {
          id: '4',
          name: 'Wordscapes',
          description: 'Encuentra palabras ocultas',
          category: 'puzzle',
          cover_image: '/api/placeholder/300/200',
          rating: 4.7,
          players_count: 1200000,
          is_multiplayer: false,
        },
        {
          id: '5',
          name: 'Chess',
          description: 'El juego de ajedrez definitivo',
          category: 'multiplayer',
          cover_image: '/api/placeholder/300/200',
          rating: 4.9,
          players_count: 800000,
          is_multiplayer: true,
        },
        {
          id: '6',
          name: 'Subway Surfers',
          description: 'Corre por las vías del tren',
          category: 'action',
          cover_image: '/api/placeholder/300/200',
          rating: 4.5,
          players_count: 2100000,
          is_featured: true,
        },
        {
          id: '7',
          name: 'Angry Birds',
          description: 'Lanza pájaros y destruye cerdos',
          category: 'action',
          cover_image: '/api/placeholder/300/200',
          rating: 4.3,
          players_count: 1500000,
        },
        {
          id: '8',
          name: 'Trivia Crack',
          description: 'Demuestra tu conocimiento',
          category: 'multiplayer',
          cover_image: '/api/placeholder/300/200',
          rating: 4.4,
          players_count: 600000,
          is_multiplayer: true,
        },
      ];

      setGames(mockGames);
      setRecentlyPlayed(mockGames.slice(0, 3));
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(game => {
    if (activeCategory !== 'all' && game.category !== activeCategory) return false;
    if (searchQuery) {
      return game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             game.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const featuredGames = games.filter(g => g.is_featured);

  const formatPlayers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Juegos</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar juegos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 px-4">
          {/* Sidebar */}
          <div className="col-span-1">
            <Card className="p-4 mb-4">
              <h2 className="font-semibold mb-3 text-gray-600">Categorías</h2>
              <div className="space-y-1">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <Button
                      key={cat.id}
                      variant={activeCategory === cat.id ? 'default' : 'ghost'}
                      className={`w-full justify-start ${activeCategory === cat.id ? 'bg-blue-600' : ''}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {cat.label}
                    </Button>
                  );
                })}
              </div>
            </Card>

            {/* Recently Played */}
            {recentlyPlayed.length > 0 && (
              <Card className="p-4">
                <h2 className="font-semibold mb-3 text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Jugados recientemente
                </h2>
                <div className="space-y-2">
                  {recentlyPlayed.map(game => (
                    <div key={game.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {game.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{game.name}</p>
                        <p className="text-xs text-gray-500">Hace 2 días</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="col-span-3">
            {/* Featured Games */}
            {!searchQuery && activeCategory === 'all' && featuredGames.length > 0 && (
              <Card className="p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-lg">Juegos destacados</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {featuredGames.map(game => (
                    <div key={game.id} className="relative group cursor-pointer">
                      <div className="aspect-[4/3] bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
                          {game.name[0]}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <Button className="bg-white text-black hover:bg-gray-100">
                            <Play className="w-4 h-4 mr-2" />
                            Jugar
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="font-semibold">{game.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span>{game.rating}</span>
                          <span>·</span>
                          <Users className="w-3 h-3" />
                          <span>{formatPlayers(game.players_count)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* All Games */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">
                  {searchQuery ? 'Resultados de búsqueda' : 'Todos los juegos'}
                </h2>
                <span className="text-gray-500 text-sm">{filteredGames.length} juegos</span>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando juegos...</p>
                </div>
              ) : filteredGames.length === 0 ? (
                <div className="text-center py-12">
                  <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No se encontraron juegos</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {filteredGames.map(game => (
                    <div key={game.id} className="group cursor-pointer">
                      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-white">
                          {game.name[0]}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <Button size="sm" className="bg-white text-black hover:bg-gray-100">
                            <Play className="w-4 h-4 mr-1" />
                            Jugar
                          </Button>
                        </div>
                        {game.is_multiplayer && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            <Users className="w-3 h-3 inline mr-1" />
                            Multi
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <h3 className="font-semibold text-sm truncate">{game.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{game.description}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span>{game.rating}</span>
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
