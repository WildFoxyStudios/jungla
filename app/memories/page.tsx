'use client';

import { useState, useEffect } from 'react';
import { postsApi, Post } from '@/lib/api-posts';
import { friendsApi } from '@/lib/api-friends';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Users, Heart, MessageCircle, Share2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import PostCard from '@/components/posts/PostCard';

interface Memory {
  id: string;
  type: 'on_this_day' | 'friendversary' | 'highlight' | 'popular_post';
  year: number;
  title: string;
  description: string;
  posts: Post[];
  friends?: any[];
  cover_image?: string;
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'highlights' | 'on_this_day'>('all');

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // Get user's posts from previous years
      const posts = await postsApi.getFeed(50, 0);
      const userPosts = posts.filter(p => {
        const postDate = new Date(p.created_at);
        return postDate.getMonth() === today.getMonth() && 
               postDate.getDate() === today.getDate() &&
               postDate.getFullYear() < currentYear;
      });

      // Get friends list for friendversaries
      const friends = await friendsApi.getFriends({ limit: 10 }).catch(() => []);

      const generatedMemories: Memory[] = [];

      // On This Day memories
      const years = [...new Set(userPosts.map(p => new Date(p.created_at).getFullYear()))].sort((a, b) => b - a);
      
      years.forEach(year => {
        const yearPosts = userPosts.filter(p => new Date(p.created_at).getFullYear() === year);
        if (yearPosts.length > 0) {
          generatedMemories.push({
            id: `otd-${year}`,
            type: 'on_this_day',
            year,
            title: `Hace ${currentYear - year} años`,
            description: `El ${today.toLocaleDateString('es', { day: 'numeric', month: 'long' })} de ${year}`,
            posts: yearPosts.slice(0, 3),
            cover_image: yearPosts[0]?.media_urls?.[0],
          });
        }
      });

      // Friendversaries (mock data based on friends)
      friends.forEach((friend: any, idx: number) => {
        if (idx < 3) {
          const yearsAgo = Math.floor(Math.random() * 5) + 1;
          generatedMemories.push({
            id: `friend-${friend.id}`,
            type: 'friendversary',
            year: currentYear - yearsAgo,
            title: `${yearsAgo} años de amistad`,
            description: `Tú y ${friend.full_name} se hicieron amigos el ${today.toLocaleDateString('es')}`,
            posts: [],
            friends: [friend],
          });
        }
      });

      // Popular posts highlight
      const popularPosts = posts
        .filter(p => (p.reactions_count + p.comments_count + p.shares_count) > 10)
        .slice(0, 5);
      
      if (popularPosts.length > 0) {
        generatedMemories.push({
          id: 'popular',
          type: 'popular_post',
          year: currentYear,
          title: 'Tus momentos populares',
          description: 'Publicaciones que más gustaron a tus amigos',
          posts: popularPosts,
          cover_image: popularPosts[0]?.media_urls?.[0],
        });
      }

      setMemories(generatedMemories);
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMemories = activeTab === 'all' 
    ? memories 
    : memories.filter(m => m.type === activeTab || (activeTab === 'highlights' && m.type === 'popular_post'));

  const renderMemory = (memory: Memory) => {
    switch (memory.type) {
      case 'on_this_day':
        return (
          <Card className="overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm opacity-90">En este día</span>
              </div>
              <h2 className="text-2xl font-bold">{memory.title}</h2>
              <p className="opacity-90">{memory.description}</p>
            </div>

            {/* Posts */}
            <div className="p-4 space-y-4">
              {memory.posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onReact={() => {}}
                  onComment={() => {}}
                  onShare={() => {}}
                />
              ))}
            </div>
          </Card>
        );

      case 'friendversary':
        return (
          <Card className="p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{memory.title}</h2>
                <p className="text-gray-600 mb-4">{memory.description}</p>
                
                {memory.friends?.map(friend => (
                  <Link key={friend.id} href={`/profile/${friend.id}`}>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {friend.full_name[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{friend.full_name}</p>
                        <p className="text-sm text-gray-500">Amigo desde {memory.year}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        );

      case 'popular_post':
        return (
          <Card className="overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm opacity-90">Destacado</span>
              </div>
              <h2 className="text-2xl font-bold">{memory.title}</h2>
              <p className="opacity-90">{memory.description}</p>
            </div>

            <div className="p-4 space-y-4">
              {memory.posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onReact={() => {}}
                  onComment={() => {}}
                  onShare={() => {}}
                />
              ))}
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 px-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Recuerdos</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 px-4">
          {[
            { id: 'all', label: 'Todo' },
            { id: 'on_this_day', label: 'En este día' },
            { id: 'highlights', label: 'Destacados' },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className={activeTab === tab.id ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Memories */}
        <div className="px-4">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando recuerdos...</p>
            </Card>
          ) : filteredMemories.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold mb-2">No hay recuerdos aún</h2>
              <p className="text-gray-600 mb-4">
                Los recuerdos aparecen cuando tienes publicaciones de años anteriores o momentos especiales con amigos
              </p>
              <Link href="/home">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Crear publicaciones
                </Button>
              </Link>
            </Card>
          ) : (
            filteredMemories.map(memory => (
              <div key={memory.id}>
                {renderMemory(memory)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
