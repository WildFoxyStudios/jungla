'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Clock, Users, ShoppingBag, Calendar, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

interface SearchResults {
  posts: any[];
  users: any[];
  groups: any[];
  pages: any[];
  products: any[];
  events: any[];
  total: number;
}

interface TrendingSearch {
  query: string;
  daily_count: number;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [trending, setTrending] = useState<TrendingSearch[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadTrending();
    loadHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      const debounce = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setResults(null);
    }
  }, [query, selectedType]);

  const loadTrending = async () => {
    try {
      const res = await fetch(`${API_URL}/search/trending`, { credentials: 'include' });
      const data = await res.json();
      setTrending(data);
    } catch (error) {
      console.error('Error loading trending:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/search/history`, { credentials: 'include' });
      const data = await res.json();
      setHistory(data.map((item: any) => item.query));
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query });
      if (selectedType !== 'all') params.append('search_type', selectedType);

      const res = await fetch(`${API_URL}/search?${params}`, { credentials: 'include' });
      const data = await res.json();
      setResults(data);
      setIsOpen(true);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`${API_URL}/search/history`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar en toda la red..."
          className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl max-h-[600px] overflow-y-auto z-50">
          {/* Filtros */}
          <div className="flex gap-2 p-3 border-b overflow-x-auto">
            {[
              { value: 'all', label: 'Todo', icon: Search },
              { value: 'people', label: 'Personas', icon: Users },
              { value: 'posts', label: 'Publicaciones', icon: FileText },
              { value: 'products', label: 'Productos', icon: ShoppingBag },
              { value: 'groups', label: 'Grupos', icon: Users },
              { value: 'events', label: 'Eventos', icon: Calendar },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                  selectedType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>

          {/* Resultados */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : results ? (
            <div className="p-4 space-y-4">
              {results.total === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron resultados para "{query}"
                </div>
              ) : (
                <>
                  {/* Usuarios */}
                  {results.users.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-700 mb-2">Personas</h3>
                      {results.users.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => router.push(`/profile/${user.id}`)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <img
                            src={user.profile_picture || '/default-avatar.png'}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-semibold">{user.full_name}</div>
                            <div className="text-sm text-gray-600">@{user.username}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Posts */}
                  {results.posts.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-700 mb-2">Publicaciones</h3>
                      {results.posts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => router.push(`/posts/${post.id}`)}
                          className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <div className="font-semibold text-sm">{post.user_name}</div>
                          <div className="text-gray-700 line-clamp-2">{post.content}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Productos */}
                  {results.products.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-700 mb-2">Productos</h3>
                      {results.products.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => router.push(`/marketplace/${product.id}`)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <img
                            src={product.image_url || '/placeholder-product.png'}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <div className="font-semibold">{product.title}</div>
                            <div className="text-blue-600 font-bold">${product.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Trending */}
              {trending.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Tendencias
                  </h3>
                  {trending.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setQuery(item.query)}
                      className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <div className="font-semibold">{item.query}</div>
                      <div className="text-sm text-gray-600">{item.daily_count} búsquedas hoy</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Historial */}
              {history.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recientes
                    </h3>
                    <button
                      onClick={clearHistory}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Limpiar
                    </button>
                  </div>
                  {history.slice(0, 5).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setQuery(item)}
                      className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
