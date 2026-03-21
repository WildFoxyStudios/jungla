'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Image as ImageIcon, Type, Smile, Music, Sticker, Aperture, ChevronLeft } from 'lucide-react';
import { uploadApi } from '@/lib/api-upload';
import { storyApi } from '@/lib/api-stories';

export default function CreateStoryPage() {
  const router = useRouter();
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#1877F2');
  const [loading, setLoading] = useState(false);
  const [storyType, setStoryType] = useState<'photo' | 'text'>('photo');

  const colors = [
    '#1877F2', '#42B72A', '#FF5733', '#C70039', '#900C3F',
    '#581845', '#FFC300', '#DAF7A6', '#FF6B6B', '#4ECDC4',
    '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setStoryType('photo');
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('session_token');
      if (!token) {
        alert('Debes iniciar sesión');
        return;
      }

      let mediaUrl = '';
      if (media && storyType === 'photo') {
        const uploaded = await uploadApi.uploadFile(media);
        mediaUrl = uploaded.url;
      }

      await storyApi.createStory({
        media_url: mediaUrl,
        caption: text,
        story_type: storyType === 'photo' ? 'image' : 'text',
        background_color: storyType === 'text' ? backgroundColor : undefined,
        text_color: storyType === 'text' ? textColor : undefined,
      }, token);

      router.push('/home');
    } catch (error) {
      console.error('Error creating story:', error);
      alert('Error al crear la historia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gray-900/90 backdrop-blur-sm">
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition"
        >
          <ChevronLeft className="w-6 h-6" />
          <span>Volver</span>
        </button>
        <h1 className="text-white font-semibold">Crear historia</h1>
        <Button
          onClick={handleCreateStory}
          disabled={loading || (storyType === 'photo' && !media) || (storyType === 'text' && !text.trim())}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Publicando...' : 'Compartir'}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex h-screen pt-16">
        {/* Preview */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="relative w-full max-w-md aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden">
            {storyType === 'photo' && mediaPreview ? (
              <img
                src={mediaPreview}
                alt="Story preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center p-8"
                style={{ backgroundColor }}
              >
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escribe algo..."
                  className="w-full h-full bg-transparent border-none text-center text-3xl font-bold resize-none focus:outline-none"
                  style={{ color: textColor }}
                />
              </div>
            )}

            {/* Text overlay for photo stories */}
            {storyType === 'photo' && text && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xl font-semibold text-center">{text}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-80 bg-gray-800 p-6 overflow-y-auto">
          {/* Story Type */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Tipo de historia</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setStoryType('photo')}
                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition ${
                  storyType === 'photo'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                Foto
              </button>
              <button
                onClick={() => setStoryType('text')}
                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition ${
                  storyType === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Type className="w-5 h-5" />
                Texto
              </button>
            </div>
          </div>

          {/* Photo Upload */}
          {storyType === 'photo' && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Foto/Video</h3>
              <label className="block w-full py-8 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition">
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <span className="text-gray-400">{media ? media.name : 'Seleccionar archivo'}</span>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              {media && (
                <button
                  onClick={() => { setMedia(null); setMediaPreview(null); }}
                  className="mt-2 text-red-400 text-sm hover:text-red-300"
                >
                  Eliminar archivo
                </button>
              )}
            </div>
          )}

          {/* Text Controls */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Texto</h3>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Agrega texto a tu historia..."
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                <Smile className="w-5 h-5 text-gray-300" />
              </button>
              <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                <Music className="w-5 h-5 text-gray-300" />
              </button>
              <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                <Sticker className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>

          {/* Background Color (for text stories) */}
          {storyType === 'text' && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Color de fondo</h3>
              <div className="grid grid-cols-5 gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setBackgroundColor(color)}
                    className={`w-10 h-10 rounded-lg transition ${
                      backgroundColor === color ? 'ring-2 ring-white' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Text Color */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Color de texto</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTextColor('#FFFFFF')}
                className={`w-10 h-10 rounded-lg bg-white ${textColor === '#FFFFFF' ? 'ring-2 ring-blue-500' : ''}`}
              />
              <button
                onClick={() => setTextColor('#000000')}
                className={`w-10 h-10 rounded-lg bg-black ${textColor === '#000000' ? 'ring-2 ring-blue-500' : ''}`}
              />
              <button
                onClick={() => setTextColor('#FF5733')}
                className={`w-10 h-10 rounded-lg bg-[#FF5733] ${textColor === '#FF5733' ? 'ring-2 ring-white' : ''}`}
              />
              <button
                onClick={() => setTextColor('#42B72A')}
                className={`w-10 h-10 rounded-lg bg-[#42B72A] ${textColor === '#42B72A' ? 'ring-2 ring-white' : ''}`}
              />
            </div>
          </div>

          {/* Tips */}
          <Card className="bg-gray-700 border-none p-4">
            <h4 className="text-white font-semibold mb-2 text-sm">Consejos</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Las historias desaparecen después de 24 horas</li>
              <li>• Puedes agregar música, stickers y efectos</li>
              <li>• Tus amigos podrán responder a tu historia</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
