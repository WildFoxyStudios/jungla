'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { searchApi, SearchResults } from '@/lib/api-search';
import { Search, Users, FileText, Building2, UsersRound, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts' | 'pages' | 'groups' | 'products'>('all');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const data = await searchApi.search(searchTerm, { type: activeTab });
      setResults(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const tabs = [
    { id: 'all' as const, label: 'Todo', icon: Search },
    { id: 'users' as const, label: 'Personas', icon: Users },
    { id: 'posts' as const, label: 'Publicaciones', icon: FileText },
    { id: 'pages' as const, label: 'Páginas', icon: Building2 },
    { id: 'groups' as const, label: 'Grupos', icon: UsersRound },
    { id: 'products' as const, label: 'Productos', icon: ShoppingBag },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-4 mb-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>
      </Card>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (searchQuery) handleSearch(searchQuery);
                  }}
                  className={`flex items-center gap-2 pb-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Buscando...</div>
      ) : !results ? (
        <Card className="p-8 text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Ingresa un término de búsqueda</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personas
              </h2>
              <div className="space-y-2">
                {results.users.map((user) => (
                  <Link key={user.id} href={`/profile/${user.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{user.full_name}</h3>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'all' &&
            results.users.length === 0 &&
            results.posts.length === 0 &&
            results.pages.length === 0 &&
            results.groups.length === 0 &&
            results.products.length === 0 && (
              <Card className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No se encontraron resultados para "{searchQuery}"</p>
              </Card>
            )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-8">Cargando búsqueda...</div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
