'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { storyApi, type Story } from '@/lib/api-stories';

interface StoryGroup {
  user_id: string;
  user_name: string;
  user_picture?: string;
  stories: Story[];
  has_unviewed: boolean;
}

export default function StoryRing({ onStoryClick }: { onStoryClick?: (stories: Story[], startIndex: number) => void }) {
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const stories = await storyApi.getActiveStories(token);
      
      const grouped = stories.reduce((acc, story) => {
        const existing = acc.find(g => g.user_id === story.user_id);
        if (existing) {
          existing.stories.push(story);
        } else {
          acc.push({
            user_id: story.user_id,
            user_name: story.user_name || 'Usuario',
            user_picture: story.user_picture,
            stories: [story],
            has_unviewed: true,
          });
        }
        return acc;
      }, [] as StoryGroup[]);

      setStoryGroups(grouped);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex gap-2 p-4">Cargando historias...</div>;
  }

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="flex gap-4 overflow-x-auto">
        {/* Create Story Button */}
        <div className="flex flex-col items-center min-w-[80px] cursor-pointer">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2 hover:bg-gray-300 transition">
            <Plus className="w-8 h-8 text-gray-600" />
          </div>
          <span className="text-xs text-center">Crear historia</span>
        </div>

        {/* Story Rings */}
        {storyGroups.map((group, idx) => (
          <div
            key={group.user_id}
            onClick={() => onStoryClick?.(group.stories, 0)}
            className="flex flex-col items-center min-w-[80px] cursor-pointer"
          >
            <div className={`w-16 h-16 rounded-full p-0.5 mb-2 ${
              group.has_unviewed 
                ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500' 
                : 'bg-gray-300'
            }`}>
              <div className="w-full h-full bg-white rounded-full p-0.5">
                {group.user_picture ? (
                  <img
                    src={group.user_picture}
                    alt={group.user_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center">
                    {group.user_name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs text-center truncate w-full">{group.user_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
