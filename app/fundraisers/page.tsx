'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Users, Target, Clock, ChevronRight, Plus, TrendingUp, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

interface Fundraiser {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  goal_amount: number;
  raised_amount: number;
  donors_count: number;
  days_left: number;
  organizer: {
    name: string;
    picture?: string;
    is_verified: boolean;
  };
  beneficiary: string;
  category: 'medical' | 'education' | 'emergency' | 'charity' | 'community';
  is_featured?: boolean;
  created_at: string;
}

export default function FundraisersPage() {
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todos', icon: Globe },
    { id: 'medical', label: 'Médico', icon: Heart },
    { id: 'education', label: 'Educación', icon: Target },
    { id: 'emergency', label: 'Emergencia', icon: Clock },
    { id: 'charity', label: 'Caridad', icon: Heart },
    { id: 'community', label: 'Comunidad', icon: Users },
  ];

  useEffect(() => {
    loadFundraisers();
  }, [activeCategory]);

  const loadFundraisers = async () => {
    try {
      setLoading(true);
      // Mock fundraisers data
      const mockFundraisers: Fundraiser[] = [
        {
          id: '1',
          title: 'Ayuda para tratamiento médico',
          description: 'Necesitamos apoyo para cubrir los gastos del tratamiento de mi padre. Cualquier ayuda es bienvenida.',
          cover_image: '/api/placeholder/400/200',
          goal_amount: 150000,
          raised_amount: 87500,
          donors_count: 234,
          days_left: 15,
          organizer: { name: 'María González', is_verified: true },
          beneficiary: 'José González',
          category: 'medical',
          is_featured: true,
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: '2',
          title: 'Reconstrucción de escuela rural',
          description: 'Ayudemos a reconstruir la escuela de la comunidad que fue afectada por las inundaciones.',
          cover_image: '/api/placeholder/400/200',
          goal_amount: 500000,
          raised_amount: 320000,
          donors_count: 456,
          days_left: 30,
          organizer: { name: 'Asociación Educativa', is_verified: true },
          beneficiary: 'Escuela Primaria Rural',
          category: 'education',
          is_featured: true,
          created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        },
        {
          id: '3',
          title: 'Apoyo tras incendio familiar',
          description: 'Mi familia perdió su hogar en un incendio. Necesitamos ayuda para reconstruir nuestras vidas.',
          cover_image: '/api/placeholder/400/200',
          goal_amount: 80000,
          raised_amount: 45000,
          donors_count: 89,
          days_left: 20,
          organizer: { name: 'Familia Rodríguez', is_verified: false },
          beneficiary: 'Familia Rodríguez',
          category: 'emergency',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: '4',
          title: 'Comedor comunitario',
          description: 'Ayuda para mantener el comedor comunitario que alimenta a 200 personas diariamente.',
          cover_image: '/api/placeholder/400/200',
          goal_amount: 100000,
          raised_amount: 67000,
          donors_count: 312,
          days_left: 25,
          organizer: { name: 'Fundación Comer Bien', is_verified: true },
          beneficiary: 'Comedor Comunitario Esperanza',
          category: 'charity',
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
        {
          id: '5',
          title: 'Cirugía de emergencia',
          description: 'Urgente: necesitamos fondos para la cirugía de emergencia de mi hermana.',
          cover_image: '/api/placeholder/400/200',
          goal_amount: 200000,
          raised_amount: 125000,
          donors_count: 178,
          days_left: 5,
          organizer: { name: 'Carlos Martínez', is_verified: false },
          beneficiary: 'Ana Martínez',
          category: 'medical',
          is_featured: true,
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: '6',
          title: 'Parque infantil comunitario',
          description: 'Construyamos un parque seguro para los niños de nuestra comunidad.',
          cover_image: '/api/placeholder/400/200',
          goal_amount: 300000,
          raised_amount: 95000,
          donors_count: 67,
          days_left: 45,
          organizer: { name: 'Vecinos Unidos', is_verified: true },
          beneficiary: 'Comunidad San José',
          category: 'community',
          created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
        },
      ];

      const filtered = activeCategory === 'all'
        ? mockFundraisers
        : mockFundraisers.filter(f => f.category === activeCategory);

      setFundraisers(filtered);
    } catch (error) {
      console.error('Error loading fundraisers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const featuredFundraisers = fundraisers.filter(f => f.is_featured);
  const regularFundraisers = fundraisers.filter(f => !f.is_featured);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Recaudaciones</h1>
              <p className="text-sm text-gray-600">Ayuda a causas importantes</p>
            </div>
          </div>
          <Link href="/fundraisers/create">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Crear recaudación
            </Button>
          </Link>
        </div>

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
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Featured Banner */}
        <Card className="mx-4 mb-6 p-6 bg-gradient-to-r from-green-500 to-teal-600 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Recaudaciones Verificadas</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Tus donaciones están protegidas</h2>
          <p className="mb-4 opacity-90">
            Facebook verifica todas las recaudaciones para garantizar que tu ayuda llegue a quien la necesita.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Protección de donaciones
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              $2.5B+ recaudados
            </span>
          </div>
        </Card>

        {/* Content */}
        <div className="px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando recaudaciones...</p>
            </div>
          ) : fundraisers.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold mb-2">No hay recaudaciones activas</h2>
              <p className="text-gray-600 mb-4">
                Sé el primero en crear una recaudación para ayudar a una causa importante
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                Crear recaudación
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Featured Fundraisers */}
              {featuredFundraisers.length > 0 && (
                <div>
                  <h2 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Destacadas
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featuredFundraisers.map(fundraiser => (
                      <Card key={fundraiser.id} className="overflow-hidden hover:shadow-lg transition">
                        <div className="h-40 bg-gradient-to-br from-green-400 to-teal-500 relative">
                          <div className="absolute inset-0 flex items-center justify-center text-white text-5xl">
                            ❤️
                          </div>
                          {fundraiser.organizer.is_verified && (
                            <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Shield className="w-3 h-3 text-green-600" />
                              Verificada
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-1">{fundraiser.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{fundraiser.description.slice(0, 100)}...</p>
                          
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-semibold text-green-600">{formatAmount(fundraiser.raised_amount)}</span>
                              <span className="text-gray-500">meta {formatAmount(fundraiser.goal_amount)}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-600 transition-all"
                                style={{ width: `${calculateProgress(fundraiser.raised_amount, fundraiser.goal_amount)}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{fundraiser.donors_count} donadores</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {fundraiser.days_left} días restantes
                            </span>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button className="flex-1 bg-green-600 hover:bg-green-700">
                              Donar ahora
                            </Button>
                            <Button variant="outline" size="icon">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Fundraisers */}
              {regularFundraisers.length > 0 && (
                <div>
                  {featuredFundraisers.length > 0 && (
                    <h2 className="font-semibold text-gray-600 mb-3">Más recaudaciones</h2>
                  )}
                  <div className="space-y-4">
                    {regularFundraisers.map(fundraiser => (
                      <Card key={fundraiser.id} className="p-4 hover:shadow-md transition">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-3xl flex-shrink-0">
                            ❤️
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold hover:text-green-600 cursor-pointer">{fundraiser.title}</h3>
                                <p className="text-sm text-gray-600">Por {fundraiser.organizer.name}</p>
                              </div>
                              {fundraiser.organizer.is_verified && (
                                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  Verificada
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{fundraiser.description}</p>

                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-semibold">{formatAmount(fundraiser.raised_amount)} recaudados</span>
                                <span className="text-gray-500">meta {formatAmount(fundraiser.goal_amount)}</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500"
                                  style={{ width: `${calculateProgress(fundraiser.raised_amount, fundraiser.goal_amount)}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{fundraiser.donors_count} donaciones</span>
                                <span>{fundraiser.days_left} días restantes</span>
                              </div>
                              <Button size="sm" variant="outline">Ver más</Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
