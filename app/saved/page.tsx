'use client';

import { useState, useEffect } from 'react';
import { postsApi, Post } from '@/lib/api-posts';
import { pagesApi } from '@/lib/api-pages';
import { marketplaceApi, MarketplaceProduct } from '@/lib/api-marketplace';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Clock, ExternalLink, MoreHorizontal, Trash2, Filter, Search, Grid3X3, List } from 'lucide-react';
import Link from 'next/link';
import PostCard from '@/components/posts/PostCard';

interface SavedItem {
  id: string;
  type: 'post' | 'page' | 'product' | 'video' | 'link';
  data: Post | any;
  saved_at: string;
  collection?: string;
}

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [collections, setCollections] = useState(['Todos', 'Para leer después', 'Favoritos', 'Compras']);

  const filters = [
    { id: 'all', label: 'Todo', icon: Bookmark },
    { id: 'posts', label: 'Publicaciones', icon: Grid3X3 },
    { id: 'videos', label: 'Videos', icon: Grid3X3 },
    { id: 'products', label: 'Productos', icon: Grid3X3 },
    { id: 'pages', label: 'Páginas', icon: Grid3X3 },
    { id: 'links', label: 'Enlaces', icon: ExternalLink },
  ];

  useEffect(() => {
    loadSavedItems();
  }, []);

  const loadSavedItems = async () => {
    try {
      setLoading(true);
      // In a real app, this would call a saved items API
      // For now, we'll simulate with local storage or fetch from various APIs
      const mockSaved: SavedItem[] = [];
      
      // Try to get saved posts
      try {
        const posts = await postsApi.getFeedPosts(10, 0);
        posts.slice(0, 3).forEach((post, idx) => {
          mockSaved.push({
            id: `post-${post.id}`,
            type: 'post',
            data: post,
            saved_at: new Date(Date.now() - idx * 86400000).toISOString(),
            collection: idx === 0 ? 'Favoritos' : undefined,
          });
        });
      } catch (e) {}

      // Try to get followed pages as "saved"
      try {
        const pages = await pagesApi.getFollowedPages({ limit: 5 });
        pages.forEach((page: any, idx: number) => {
          mockSaved.push({
            id: `page-${page.id}`,
            type: 'page',
            data: page,
            saved_at: new Date(Date.now() - idx * 172800000).toISOString(),
          });
        });
      } catch (e) {}

      // Try to get saved products
      try {
        const products = await marketplaceApi.searchProducts();
        products.slice(0, 2).forEach((product: any, idx: number) => {
          mockSaved.push({
            id: `product-${product.id}`,
            type: 'product',
            data: product,
            saved_at: new Date(Date.now() - idx * 259200000).toISOString(),
            collection: 'Compras',
          });
        });
      } catch (e) {}

      setSavedItems(mockSaved);
    } catch (error) {
      console.error('Error loading saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = savedItems.filter(item => {
    if (activeFilter !== 'all' && item.type !== activeFilter.slice(0, -1)) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const content = item.data.content || item.data.title || item.data.name || '';
      return content.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const removeItem = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const formatSavedDate = (date: string) => {
    const saved = new Date(date);
    const now = new Date();
    const diff = now.getTime() - saved.getTime();
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    return saved.toLocaleDateString('es');
  };

  const renderSavedItem = (item: SavedItem) => {
    switch (item.type) {
      case 'post':
        return (
          <PostCard
            post={item.data}
            onReact={(type) => console.log('React:', type)}
            onComment={() => console.log('Comment')}
            onShare={() => console.log('Share')}
          />
        );

      case 'page':
        const page = item.data;
        return (
          <Card className="p-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-2xl font-bold">
                {page.name?.[0] || 'P'}
              </div>
              <div className="flex-1">
                <Link href={`/pages/${page.id}`}>
                  <h3 className="font-semibold hover:underline">{page.name}</h3>
                </Link>
                <p className="text-sm text-gray-600 line-clamp-2">{page.description || page.category}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{page.followers_count || 0} seguidores</span>
                  {page.rating > 0 && <span>⭐ {page.rating.toFixed(1)}</span>}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Guardado {formatSavedDate(item.saved_at)}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );

      case 'product':
        const product = item.data;
        return (
          <Card className="p-4">
            <div className="flex gap-4">
              {product.images?.[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.title}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-lg font-bold text-green-600">${product.price}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Guardado {formatSavedDate(item.saved_at)}
                    {item.collection && (
                      <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        {item.collection}
                      </span>
                    )}
                  </span>
                  <div className="flex gap-2">
                    <Link href={`/marketplace/${product.id}`}>
                      <Button size="sm">Ver producto</Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-bold">Guardado</h1>
          </div>
          <Button variant="outline">
            + Nueva colección
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4 px-4">
          {/* Sidebar - Collections */}
          <div className="col-span-1">
            <Card className="p-4">
              <h2 className="font-semibold mb-3 text-gray-600">Colecciones</h2>
              <div className="space-y-1">
                {collections.map(col => (
                  <Button 
                    key={col}
                    variant="ghost" 
                    className="w-full justify-start text-sm"
                  >
                    <Bookmark className="w-4 h-4 mr-2 text-purple-600" />
                    {col}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-3">
            {/* Filters & Search */}
            <Card className="p-4 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar en guardados..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
                <div className="flex border rounded-lg overflow-hidden">
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-purple-600' : ''}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-purple-600' : ''}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 flex-wrap">
                {filters.map(filter => (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveFilter(filter.id)}
                    className={activeFilter === filter.id ? 'bg-purple-600' : ''}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Saved Items */}
            {loading ? (
              <Card className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando elementos guardados...</p>
              </Card>
            ) : filteredItems.length === 0 ? (
              <Card className="p-12 text-center">
                <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold mb-2">No tienes elementos guardados</h2>
                <p className="text-gray-600 mb-4">
                  Guarda publicaciones, videos, productos y enlaces para verlos más tarde
                </p>
                <div className="flex gap-2 justify-center">
                  <Link href="/home">
                    <Button>Explorar publicaciones</Button>
                  </Link>
                  <Link href="/marketplace">
                    <Button variant="outline">Ver marketplace</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredItems.map(item => (
                  <div key={item.id}>
                    {renderSavedItem(item)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
