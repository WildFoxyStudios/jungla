'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { postsApi, Post } from '@/lib/api-posts';
import PostCard from './PostCard';
import { Loader2 } from 'lucide-react';

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const limit = 10;

  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadPosts();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

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

    const handlePostCreated = () => {
      loadPosts(true);
    };

    window.addEventListener('post-created', handlePostCreated);
    return () => window.removeEventListener('post-created', handlePostCreated);
  }, []);

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
              <div className="h-4 bg-gray-200 rounded w-3/5" />
            </div>
            <div className="h-64 bg-gray-200 rounded-lg mb-3" />
            <div className="flex gap-4">
              <div className="h-8 bg-gray-200 rounded flex-1" />
              <div className="h-8 bg-gray-200 rounded flex-1" />
              <div className="h-8 bg-gray-200 rounded flex-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl">📝</span>
        </div>
        <p className="text-lg mb-2 font-semibold">No hay publicaciones aún</p>
        <p className="text-sm">¡Comparte algo con tus amigos para comenzar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => {
        if (posts.length === index + 1) {
          return (
            <div ref={lastPostRef} key={post.id}>
              <PostCard
                post={post}
                onReact={(type) => console.log('React:', type)}
                onComment={() => console.log('Comment')}
                onShare={() => console.log('Share')}
              />
            </div>
          );
        } else {
          return (
            <PostCard
              key={post.id}
              post={post}
              onReact={(type) => console.log('React:', type)}
              onComment={() => console.log('Comment')}
              onShare={() => console.log('Share')}
            />
          );
        }
      })}

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
}
