'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, X, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { storyApi, Story } from '@/lib/api-stories';
import { uploadApi } from '@/lib/api-upload';

interface StoryWithViewed extends Story {
  is_viewed?: boolean;
  username?: string;
}

export default function StoriesViewer() {
  const { user } = useAuth();
  const [stories, setStories] = useState<StoryWithViewed[]>([]);
  const [selectedStory, setSelectedStory] = useState<StoryWithViewed | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('session_token');
      if (!token) return;
      
      const data = await storyApi.getActiveStories(token);
      const storiesWithViewed = data.map(s => ({
        ...s,
        username: s.user_name || 'Usuario',
        is_viewed: viewedStories.has(s.id),
      }));
      setStories(storiesWithViewed);
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('session_token');
      if (!token) return;

      const uploadedFiles = await uploadApi.uploadMultiple([file]);
      if (uploadedFiles.length === 0) return;

      const uploaded = uploadedFiles[0];
      await storyApi.createStory({
        media_url: uploaded.url,
        media_type: uploaded.file_type,
      }, token);

      await fetchStories();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setUploading(false);
    }
  };

  const openStory = async (story: StoryWithViewed, index: number) => {
    setSelectedStory(story);
    setCurrentIndex(index);
    
    if (!story.is_viewed && !viewedStories.has(story.id)) {
      try {
        const token = localStorage.getItem('session_token');
        if (token) {
          await storyApi.viewStory(story.id, token);
          setViewedStories(prev => new Set(prev).add(story.id));
          setStories(prev => prev.map(s => 
            s.id === story.id ? { ...s, is_viewed: true } : s
          ));
        }
      } catch (error) {
        console.error('Error viewing story:', error);
      }
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
            onClick={() => setShowCreateModal(true)}
          >
            <div className="relative h-44 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden group hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs text-center font-medium text-white drop-shadow-lg">Crear historia</p>
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Crear historia</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="story-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="story-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {uploading ? 'Subiendo...' : 'Selecciona una foto o video'}
                  </p>
                  <p className="text-xs text-gray-500">
                    o arrastra un archivo aquí
                  </p>
                </label>
              </div>
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
