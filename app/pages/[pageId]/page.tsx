'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { pagesApi, Page, PagePost } from '@/lib/api-pages';
import { MapPin, Phone, Mail, Globe, Star, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PostCard from '@/components/posts/PostCard';

export default function PageDetailPage() {
  const params = useParams();
  const pageId = params.pageId as string;
  const [page, setPage] = useState<Page | null>(null);
  const [posts, setPosts] = useState<PagePost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pageId) {
      loadPage();
      loadPosts();
    }
  }, [pageId]);

  const loadPage = async () => {
    try {
      const data = await pagesApi.getPage(pageId);
      setPage(data);
      // TODO: Check if following
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await pagesApi.getPagePosts(pageId);
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await pagesApi.unfollowPage(pageId);
      } else {
        await pagesApi.followPage(pageId);
      }
      setIsFollowing(!isFollowing);
      if (page) {
        setPage({
          ...page,
          followers_count: page.followers_count + (isFollowing ? -1 : 1),
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">Cargando...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Página no encontrada</p>
          <Link href="/pages">
            <Button className="mt-4">Volver a páginas</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Back Button */}
      <Link href="/pages">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </Link>

      {/* Cover Photo */}
      <Card className="overflow-hidden mb-4">
        <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {page.cover_photo_url && (
            <img
              src={page.cover_photo_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Section */}
        <div className="p-6">
          <div className="flex items-start gap-4 -mt-20 mb-4">
            <div className="w-32 h-32 rounded-xl bg-white border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
              {page.profile_picture_url ? (
                <img
                  src={page.profile_picture_url}
                  alt={page.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">
                  📄
                </div>
              )}
            </div>
            <div className="flex-1 pt-16">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{page.name}</h1>
                    {page.verified && (
                      <span className="text-blue-500 text-xl">✓</span>
                    )}
                  </div>
                  <p className="text-gray-600">{page.category}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {page.followers_count} seguidores
                    </span>
                    {page.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {page.rating.toFixed(1)} ({page.review_count} reseñas)
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleFollowToggle}
                  variant={isFollowing ? 'outline' : 'default'}
                >
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          {page.description && (
            <p className="text-gray-700 mb-4">{page.description}</p>
          )}

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {page.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                {page.location}
              </div>
            )}
            {page.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                {page.phone}
              </div>
            )}
            {page.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                {page.email}
              </div>
            )}
            {page.website && (
              <a
                href={page.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <Globe className="w-4 h-4" />
                {page.website}
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-4">
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            <button className="pb-3 px-2 border-b-2 border-blue-600 font-semibold text-blue-600">
              Publicaciones
            </button>
            <button className="pb-3 px-2 text-gray-600 hover:text-gray-900">
              Información
            </button>
            <button className="pb-3 px-2 text-gray-600 hover:text-gray-900">
              Reseñas
            </button>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No hay publicaciones todavía
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                user_id: page.id,
                visibility: 'public',
                tagged_users: [],
                custom_audience_lists: [],
                is_pinned: false,
                is_archived: false,
                media_metadata: {},
                updated_at: post.created_at,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
