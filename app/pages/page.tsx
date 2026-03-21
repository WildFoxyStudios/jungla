'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { pagesApi, Page } from '@/lib/api-pages';
import { Plus, Search, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default function PagesPage() {
  const [followedPages, setFollowedPages] = useState<Page[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadFollowedPages();
  }, []);

  const loadFollowedPages = async () => {
    try {
      const pages = await pagesApi.getFollowedPages();
      setFollowedPages(pages);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await pagesApi.searchPages(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching pages:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleFollow = async (pageId: string) => {
    try {
      await pagesApi.followPage(pageId);
      loadFollowedPages();
    } catch (error) {
      console.error('Error following page:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Páginas</h1>
        <Link href="/pages/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Crear página
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar páginas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button type="submit" disabled={searching}>
            {searching ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Resultados de búsqueda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((page) => (
              <PageCard key={page.id} page={page} onFollow={handleFollow} />
            ))}
          </div>
        </div>
      )}

      {/* Followed Pages */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Páginas que sigues
        </h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : followedPages.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No sigues ninguna página todavía</p>
            <p className="text-sm mt-1">Busca páginas para empezar a seguir</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followedPages.map((page) => (
              <PageCard key={page.id} page={page} isFollowing />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PageCardProps {
  page: Page;
  onFollow?: (pageId: string) => void;
  isFollowing?: boolean;
}

function PageCard({ page, onFollow, isFollowing }: PageCardProps) {
  return (
    <Link href={`/pages/${page.id}`}>
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex gap-3">
          <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
            {page.profile_picture_url ? (
              <img
                src={page.profile_picture_url}
                alt={page.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                📄
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold truncate">{page.name}</h3>
              {page.verified && <span className="text-blue-500">✓</span>}
            </div>
            <p className="text-sm text-gray-600">{page.category}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span>{page.followers_count} seguidores</span>
              {page.rating > 0 && (
                <span>⭐ {page.rating.toFixed(1)} ({page.review_count})</span>
              )}
            </div>
          </div>
        </div>
        {!isFollowing && onFollow && (
          <Button
            size="sm"
            className="w-full mt-3"
            onClick={(e) => {
              e.preventDefault();
              onFollow(page.id);
            }}
          >
            Seguir
          </Button>
        )}
      </Card>
    </Link>
  );
}
