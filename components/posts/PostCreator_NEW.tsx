'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { postsApi } from '@/lib/api-posts';
import { pollsApi } from '@/lib/api-polls';
import { Smile, MapPin, Image as ImageIcon, Users, Globe, BarChart3 } from 'lucide-react';
import MediaUploader from './MediaUploader';
import PollCreator, { PollData } from './PollCreator';
import { UploadedFile } from '@/lib/api-upload';

export default function PostCreator() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleSubmit = async () => {
    if (!content.trim() && uploadedFiles.length === 0 && !pollData) return;

    setIsLoading(true);
    try {
      const post = await postsApi.createPost({
        content: content.trim() || undefined,
        media_urls: uploadedFiles.map(f => f.url),
        visibility,
      });

      if (pollData) {
        await pollsApi.createPoll(post.id, pollData);
      }

      setContent('');
      setUploadedFiles([]);
      setPollData(null);
      setShowPollCreator(false);
      setIsExpanded(false);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('post-created'));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error al crear la publicación');
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
          {showPollCreator && !pollData && (
            <div className="mt-3">
              <PollCreator
                onCancel={() => setShowPollCreator(false)}
                onSave={(data) => {
                  setPollData(data);
                  setShowPollCreator(false);
                }}
              />
            </div>
          )}

          {pollData && !showPollCreator && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-sm">📊 {pollData.question}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {pollData.options.length} opciones
                    {pollData.allows_multiple_answers && ' • Múltiple selección'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPollData(null)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          )}

          {!showPollCreator && !pollData && (
            <div className="mt-3">
              <MediaUploader
                onUploadComplete={setUploadedFiles}
                maxFiles={10}
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex gap-2 flex-wrap">
              {!pollData && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPollCreator(!showPollCreator)}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">Encuesta</span>
                </Button>
              )}
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
              disabled={(!content.trim() && uploadedFiles.length === 0 && !pollData) || isLoading}
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
