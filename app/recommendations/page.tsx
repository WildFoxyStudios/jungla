'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MapPin, Star, Utensils, Coffee, ShoppingBag, Hotel, Camera, Search, Filter, ChevronRight, Heart } from 'lucide-react';
import Link from 'next/link';

interface Recommendation {
  id: string;
  type: 'restaurant' | 'cafe' | 'shop' | 'hotel' | 'attraction';
  name: string;
  description: string;
  location: string;
  rating: number;
  review_count: number;
  image: string;
  price_range: string;
  is_open: boolean;
  distance: string;
  recommended_by?: string;
  tags: string[];
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Todo', icon: Star },
    { id: 'restaurant', label: 'Restaurantes', icon: Utensils },
    { id: 'cafe', label: 'Cafés', icon: Coffee },
    { id: 'shop', label: 'Tiendas', icon: ShoppingBag },
    { id: 'hotel', label: 'Hoteles', icon: Hotel },
    { id: 'attraction', label: 'Atracciones', icon: Camera },
  ];

  useEffect(() => {
    loadRecommendations();
  }, [activeCategory]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      // Mock recommendations data
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          type: 'restaurant',
          name: 'La Casa del Taco',
          description: 'Los mejores tacos de la ciudad. Auténtica comida mexicana con recetas tradicionales.',
          location: 'Centro Histórico, CDMX',
          rating: 4.8,
          review_count: 2340,
          image: '/api/placeholder/300/200',
          price_range: '$$',
          is_open: true,
          distance: '2.3 km',
          recommended_by: 'Carlos M. y 5 amigos más',
          tags: ['Mexicana', 'Tacos', 'Barato'],
        },
        {
          id: '2',
          type: 'cafe',
          name: 'Café Literario',
          description: 'Ambiente acogedor perfecto para trabajar o leer. Café de especialidad y pastelitos.',
          location: 'Roma Norte, CDMX',
          rating: 4.6,
          review_count: 892,
          image: '/api/placeholder/300/200',
          price_range: '$$',
          is_open: true,
          distance: '1.5 km',
          recommended_by: 'Ana L. y 3 amigos más',
          tags: ['Café', 'Tranquilo', 'Wifi'],
        },
        {
          id: '3',
          type: 'restaurant',
          name: 'Sushi Master',
          description: 'Sushi fresco y creativo. Barra interactiva donde el chef prepara tu comida frente a ti.',
          location: 'Polanco, CDMX',
          rating: 4.9,
          review_count: 1567,
          image: '/api/placeholder/300/200',
          price_range: '$$$',
          is_open: true,
          distance: '4.2 km',
          recommended_by: 'Pedro G. y 8 amigos más',
          tags: ['Japonés', 'Sushi', 'Romántico'],
        },
        {
          id: '4',
          type: 'attraction',
          name: 'Museo de Arte Moderno',
          description: 'Colección impresionante de arte contemporáneo. Exhibiciones rotativas cada mes.',
          location: 'Bosque de Chapultepec, CDMX',
          rating: 4.7,
          review_count: 3210,
          image: '/api/placeholder/300/200',
          price_range: '$',
          is_open: true,
          distance: '3.8 km',
          recommended_by: 'María R. y 12 amigos más',
          tags: ['Cultura', 'Arte', 'Familiar'],
        },
        {
          id: '5',
          type: 'shop',
          name: 'Mercado de Artesanías',
          description: 'Productos locales hechos a mano. Desde joyería hasta textiles tradicionales.',
          location: 'Coyoacán, CDMX',
          rating: 4.5,
          review_count: 678,
          image: '/api/placeholder/300/200',
          price_range: '$$',
          is_open: false,
          distance: '5.1 km',
          recommended_by: 'Luisa P. y 4 amigos más',
          tags: ['Artesanías', 'Local', 'Regalos'],
        },
        {
          id: '6',
          type: 'hotel',
          name: 'Hotel Boutique Centro',
          description: 'Ubicación perfecta en el corazón de la ciudad. Decoración elegante y servicio excepcional.',
          location: 'Centro, CDMX',
          rating: 4.4,
          review_count: 445,
          image: '/api/placeholder/300/200',
          price_range: '$$$$',
          is_open: true,
          distance: '0.8 km',
          recommended_by: 'Roberto S. y 2 amigos más',
          tags: ['Hotel', 'Lujo', 'Centro'],
        },
      ];

      const filtered = activeCategory === 'all'
        ? mockRecommendations
        : mockRecommendations.filter(r => r.type === activeCategory);

      setRecommendations(filtered);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return <Utensils className="w-5 h-5" />;
      case 'cafe': return <Coffee className="w-5 h-5" />;
      case 'shop': return <ShoppingBag className="w-5 h-5" />;
      case 'hotel': return <Hotel className="w-5 h-5" />;
      case 'attraction': return <Camera className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (type: string) => {
    const category = categories.find(c => c.id === type);
    return category?.label || type;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 px-4">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <ThumbsUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Recomendaciones</h1>
            <p className="text-sm text-gray-600">Lugares recomendados por tus amigos</p>
          </div>
        </div>

        {/* Search */}
        <Card className="mx-4 p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar restaurantes, cafés, tiendas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </Card>

        {/* Categories */}
        <div className="flex gap-2 mb-6 px-4 overflow-x-auto">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando recomendaciones...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <Card className="p-12 text-center">
              <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold mb-2">No hay recomendaciones</h2>
              <p className="text-gray-600">Explora y descubre lugares para compartir con amigos</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map(rec => (
                <Card key={rec.id} className="overflow-hidden hover:shadow-lg transition group">
                  {/* Image */}
                  <div className="h-40 bg-gradient-to-br from-orange-100 to-yellow-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-5xl">
                      {getCategoryIcon(rec.type)}
                    </div>
                    <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      {getCategoryIcon(rec.type)}
                      {getCategoryLabel(rec.type)}
                    </div>
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                      rec.is_open ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {rec.is_open ? 'Abierto' : 'Cerrado'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg group-hover:text-orange-600 transition">{rec.name}</h3>
                      <span className="text-orange-600 font-semibold">{rec.price_range}</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{rec.description}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{rec.rating}</span>
                      </div>
                      <span className="text-gray-400">·</span>
                      <span className="text-sm text-gray-500">{rec.review_count} reseñas</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{rec.location}</span>
                      <span className="text-gray-300">·</span>
                      <span>{rec.distance}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {rec.tags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Recommended by */}
                    {rec.recommended_by && (
                      <p className="text-xs text-gray-500 mb-3">
                        Recomendado por {rec.recommended_by}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
                        Ver detalles
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add Recommendation CTA */}
        <Card className="mx-4 mt-6 p-6 bg-gradient-to-r from-orange-100 to-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">¿Conoces un lugar genial?</h3>
              <p className="text-gray-600">Comparte tus lugares favoritos con amigos</p>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <ThumbsUp className="w-4 h-4 mr-2" />
              Recomendar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
