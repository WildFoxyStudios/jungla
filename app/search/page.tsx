'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { searchApi, SearchResults } from '@/lib/api-search';
import { Search, Users, FileText, Building2, UsersRound, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
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
      {/* Search Bar */}
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

      {/* Tabs */}
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
                  className={`
                    flex items-center gap-2 pb-3 px-3 border-b-2 whitespace-nowrap transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Buscando...</div>
      ) : !results ? (
        <Card className="p-8 text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Ingresa un término de búsqueda</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Users */}
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
                          {user.bio && (
                            <p className="text-sm text-gray-500 truncate mt-1">{user.bio}</p>
                          )}
                          {user.mutual_friends_count > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {user.mutual_friends_count} amigos en común
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Publicaciones
              </h2>
              <div className="space-y-2">
                {results.posts.map((post) => (
                  <Card key={post.id} className="p-4">
                    <p className="text-sm line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{post.reactions_count} reacciones</span>
                      <span>{post.comments_count} comentarios</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Pages */}
          {(activeTab === 'all' || activeTab === 'pages') && results.pages.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Páginas
              </h2>
              <div className="space-y-2">
                {results.pages.map((page) => (
                  <Link key={page.id} href={`/pages/${page.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0" />
                        <div>
                          <div className="flex items-center gap-1">
                            <h3 className="font-semibold">{page.name}</h3>
                            {page.verified && <span className="text-blue-500">✓</span>}
                          </div>
                          <p className="text-sm text-gray-600">{page.category}</p>
                          <p className="text-xs text-gray-500">
                            {page.followers_count} seguidores
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Groups */}
          {(activeTab === 'all' || activeTab === 'groups') && results.groups.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <UsersRound className="w-5 h-5" />
                Grupos
              </h2>
              <div className="space-y-2">
                {results.groups.map((group) => (
                  <Link key={group.id} href={`/groups/${group.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold">{group.name}</h3>
                          <p className="text-sm text-gray-600">
                            {group.privacy === 'public' ? '🌍 Público' : '🔒 Privado'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {group.members_count} miembros
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {(activeTab === 'all' || activeTab === 'products') && results.products.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Productos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.products.map((product) => (
                  <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex gap-3">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          ${product.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">{product.condition}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
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
