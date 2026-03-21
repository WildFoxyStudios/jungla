'use client';

import { useState, useEffect, useRef } from 'react';
import { postsApi, Post } from '@/lib/api-posts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, ThumbsUp, MessageCircle, Share2, MoreHorizontal, Clock, Eye } from 'lucide-react';
import Link from 'next/link';

interface VideoPost extends Post {
  user_name?: string;
  views_count?: number;
  is_playing?: boolean;
  is_muted?: boolean;
  progress?: number;
}

export default function WatchPage() {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const categories = [
    { id: 'all', label: 'Para ti' },
    { id: 'live', label: 'En vivo' },
    { id: 'following', label: 'Siguiendo' },
    { id: 'saved', label: 'Guardados' },
    { id: 'gaming', label: 'Juegos' },
  ];

  useEffect(() => {
    loadVideos();
  }, [activeCategory]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const posts = await postsApi.getFeed(20, 0);
      const videoPosts = posts.filter((post: Post) => 
        post.media_urls?.some(url => 
          url.match(/\.(mp4|webm|mov|avi)$/i) || 
          post.content?.includes('video')
        )
      );
      setVideos(videoPosts.map((v: Post) => ({ ...v, is_muted: true })));
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    setVideos(prev => prev.map((v: VideoPost) => {
      if (v.id === videoId) {
        if (v.is_playing) {
          video.pause();
        } else {
          video.play();
        }
        return { ...v, is_playing: !v.is_playing };
      }
      return { ...v, is_playing: false };
    }));
  };

  const toggleMute = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    video.muted = !video.muted;
    setVideos(prev => prev.map(v => 
      v.id === videoId ? { ...v, is_muted: video.muted } : v
    ));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-bold">Watch</h1>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 px-4 overflow-x-auto pb-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              onClick={() => setActiveCategory(cat.id)}
              className={activeCategory === cat.id ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <Card className="p-12 text-center mx-4">
            <Play className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-600">No hay videos disponibles</p>
            <p className="text-sm text-gray-500 mt-2">Los videos aparecerán aquí cuando haya contenido</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                {/* Video Player */}
                <div className="relative aspect-video bg-black group">
                  {video.media_urls?.[0] ? (
                    <video
                      ref={el => { videoRefs.current[video.id] = el; }}
                      src={video.media_urls[0]}
                      className="w-full h-full object-cover"
                      muted={video.is_muted}
                      loop
                      playsInline
                      onClick={() => togglePlay(video.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <Play className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Play/Pause Overlay */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    onClick={() => togglePlay(video.id)}
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      {video.is_playing ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                      )}
                    </div>
                  </div>

                  {/* Mute Button */}
                  <button
                    onClick={() => toggleMute(video.id)}
                    className="absolute bottom-3 right-3 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition"
                  >
                    {video.is_muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  {/* Duration Badge */}
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    <Clock className="w-3 h-3 inline mr-1" />
                    2:34
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <Link href={`/profile/${video.user_id}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {video.user_name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{video.user_name || 'Usuario'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(video.created_at).toLocaleDateString('es')}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <p className="text-sm mb-3 line-clamp-2">{video.content}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {video.views_count || 0} vistas
                    </span>
                    <span>{video.reactions_count || 0} reacciones</span>
                    <span>{video.comments_count || 0} comentarios</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Me gusta
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Comentar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
