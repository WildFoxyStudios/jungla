'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { postsApi } from '@/lib/api-posts';
import { Smile, MapPin, Image as ImageIcon, Users, Globe } from 'lucide-react';

export default function PostCreator() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visibility, setVisibility] = useState('public');

  const handleSubmit = async () => {
    if (!content.trim() && !isLoading) return;

    setIsLoading(true);
    try {
      await postsApi.createPost({
        content,
        visibility,
      });
      setContent('');
      setIsExpanded(false);
      
      // Refresh feed - disparar evento personalizado
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('post-created'));
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <textarea
            placeholder={`¿Qué estás pensando, ${user?.username}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="w-full resize-none border-none outline-none bg-gray-100 rounded-3xl px-4 py-3 min-h-[48px]"
            rows={isExpanded ? 4 : 1}
          />
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Foto/video</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Etiquetar</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">Sentimiento</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">Ubicación</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Público</span>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {isLoading ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
