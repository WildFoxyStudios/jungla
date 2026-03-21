'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Story {
  id: string;
  user_id: string;
  username: string;
  profile_picture?: string;
  media_url: string;
  media_type: string;
  created_at: string;
  is_viewed: boolean;
}

export default function StoriesViewer() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    const mockStories: Story[] = [
      {
        id: '1',
        user_id: user?.id || '1',
        username: user?.username || 'Tu historia',
        media_url: '/api/placeholder/400/600',
        media_type: 'image',
        created_at: new Date().toISOString(),
        is_viewed: false,
      },
      {
        id: '2',
        user_id: '2',
        username: 'María González',
        media_url: '/api/placeholder/400/600',
        media_type: 'image',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_viewed: false,
      },
      {
        id: '3',
        user_id: '3',
        username: 'Carlos Ruiz',
        media_url: '/api/placeholder/400/600',
        media_type: 'image',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        is_viewed: true,
      },
      {
        id: '4',
        user_id: '4',
        username: 'Ana López',
        media_url: '/api/placeholder/400/600',
        media_type: 'image',
        created_at: new Date(Date.now() - 10800000).toISOString(),
        is_viewed: false,
      },
      {
        id: '5',
        user_id: '5',
        username: 'Pedro Martínez',
        media_url: '/api/placeholder/400/600',
        media_type: 'image',
        created_at: new Date(Date.now() - 14400000).toISOString(),
        is_viewed: true,
      },
    ];
    setStories(mockStories);
  };

  const openStory = (story: Story, index: number) => {
    setSelectedStory(story);
    setCurrentIndex(index);
    if (!story.is_viewed) {
      setStories(prev => prev.map(s => s.id === story.id ? { ...s, is_viewed: true } : s));
    }
  };

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setSelectedStory(stories[next]);
    } else {
      setSelectedStory(null);
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      setSelectedStory(stories[prev]);
    }
  };

  useEffect(() => {
    if (selectedStory) {
      const timer = setTimeout(nextStory, 5000);
      return () => clearTimeout(timer);
    }
  }, [selectedStory, currentIndex]);

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <div
            className="flex-shrink-0 w-28 cursor-pointer"
            onClick={() => {}}
          >
            <div className="relative h-44 bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg overflow-hidden group hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-center font-medium text-white">Crear historia</p>
              </div>
            </div>
          </div>

          {stories.map((story, index) => (
            <div
              key={story.id}
              className="flex-shrink-0 w-28 cursor-pointer"
              onClick={() => openStory(story, index)}
            >
              <div className={`relative h-44 rounded-lg overflow-hidden group hover:scale-105 transition-transform ${
                story.is_viewed ? 'ring-2 ring-gray-300' : 'ring-4 ring-blue-600'
              }`}>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${story.media_url})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                <div className="absolute top-3 left-3">
                  <div className={`w-10 h-10 rounded-full ${
                    story.is_viewed ? 'ring-2 ring-gray-300' : 'ring-2 ring-blue-600'
                  } bg-gray-200`} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs font-medium text-white truncate">{story.username}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={() => setSelectedStory(null)}
          >
            <X className="w-6 h-6" />
          </Button>

          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={prevStory}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {currentIndex < stories.length - 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={nextStory}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          <div className="max-w-lg w-full h-full flex flex-col">
            <div className="flex gap-1 p-2">
              {stories.map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className={`h-full bg-white transition-all ${
                      index < currentIndex ? 'w-full' : index === currentIndex ? 'animate-progress' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <p className="text-white font-semibold">{selectedStory.username}</p>
                <p className="text-white/70 text-xs">
                  {new Date(selectedStory.created_at).toLocaleTimeString('es', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={selectedStory.media_url}
                alt="Story"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 5s linear;
        }
      `}</style>
    </>
  );
}
