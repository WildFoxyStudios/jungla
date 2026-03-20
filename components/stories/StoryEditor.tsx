'use client';

import { useState, useRef } from 'react';
import { X, Type, Palette, Image as ImageIcon } from 'lucide-react';

interface StoryData {
  media_url: string;
  media_type: 'image' | 'video';
  text: string;
  text_color: string;
  background_color: string;
  stickers: string[];
  duration: number;
}

interface StoryEditorProps {
  onPublish: (story: StoryData) => void;
  onClose: () => void;
}

export default function StoryEditor({ onPublish, onClose }: StoryEditorProps) {
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [selectedSticker, setSelectedSticker] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stickers = ['😀', '😍', '🎉', '❤️', '🔥', '👍', '🌟', '💯', '🎊', '🎈'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setMediaUrl(url);
    setMediaType(file.type.startsWith('video') ? 'video' : 'image');
  };

  const handlePublish = async () => {
    if (!mediaUrl && !text) {
      alert('Agrega una imagen, video o texto');
      return;
    }

    const storyData = {
      media_url: mediaUrl,
      media_type: mediaType,
      text,
      text_color: textColor,
      background_color: backgroundColor,
      stickers: selectedSticker ? [selectedSticker] : [],
      duration: 24, // horas
    };

    onPublish(storyData);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <button onClick={onClose} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-semibold text-lg">Crear Historia</h2>
        <button
          onClick={handlePublish}
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700"
        >
          Publicar
        </button>
      </div>

      {/* Canvas de edición */}
      <div className="flex-1 relative flex items-center justify-center" style={{ backgroundColor }}>
        {/* Media de fondo */}
        {mediaUrl && (
          mediaType === 'image' ? (
            <img src={mediaUrl} alt="Story" className="max-h-full max-w-full object-contain" />
          ) : (
            <video src={mediaUrl} className="max-h-full max-w-full object-contain" controls />
          )
        )}

        {/* Texto overlay */}
        {text && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ color: textColor }}
          >
            <div className="text-4xl font-bold text-center px-8" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              {text}
            </div>
          </div>
        )}

        {/* Sticker */}
        {selectedSticker && (
          <div className="absolute top-20 right-20 text-6xl">
            {selectedSticker}
          </div>
        )}

        {/* Botón para agregar media */}
        {!mediaUrl && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white p-6 rounded-full hover:bg-blue-700"
          >
            <ImageIcon className="w-8 h-8" />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Herramientas */}
      <div className="bg-gray-900 p-4">
        <div className="flex gap-4 mb-4">
          {/* Texto */}
          <button
            onClick={() => {
              const newText = prompt('Escribe tu texto:');
              if (newText) setText(newText);
            }}
            className="flex-1 bg-gray-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700"
          >
            <Type className="w-5 h-5" />
            <span>Texto</span>
          </button>

          {/* Color de texto */}
          <label className="flex-1 bg-gray-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 cursor-pointer">
            <Palette className="w-5 h-5" />
            <span>Color</span>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-0 h-0 opacity-0"
            />
          </label>

          {/* Fondo */}
          <label className="flex-1 bg-gray-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 cursor-pointer">
            <Palette className="w-5 h-5" />
            <span>Fondo</span>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-0 h-0 opacity-0"
            />
          </label>
        </div>

        {/* Stickers */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {stickers.map((sticker) => (
            <button
              key={sticker}
              onClick={() => setSelectedSticker(sticker)}
              className={`text-4xl p-2 rounded-lg ${
                selectedSticker === sticker ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
