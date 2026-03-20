'use client';

import { useEffect, useState } from 'react';
import { postsApi, Post } from '@/lib/api-posts';
import PostCard from './PostCard';
import { Button } from '@/components/ui/button';

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const loadPosts = async (reset = false) => {
    try {
      setLoading(true);
      const newOffset = reset ? 0 : offset;
      const newPosts = await postsApi.getFeed(limit, newOffset);
      
      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === limit);
      setOffset(newOffset + newPosts.length);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(true);
  }, []);

  const handleLoadMore = () => {
    loadPosts();
  };

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center text-gray-500">
        <p className="text-lg mb-2">No hay publicaciones aún</p>
        <p className="text-sm">¡Sé el primero en publicar algo!</p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onReact={(type) => console.log('React:', type)}
          onComment={() => console.log('Comment')}
          onShare={() => console.log('Share')}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center py-4">
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outline"
            className="w-full max-w-xs"
          >
            {loading ? 'Cargando...' : 'Ver más publicaciones'}
          </Button>
        </div>
      )}
    </div>
  );
}
