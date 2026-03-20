'use client';

import { useState, useEffect } from 'react';
import { streamingApi, type LiveStream } from '@/lib/api-streaming';
import { Radio, Users, Eye, Play } from 'lucide-react';

export default function LivePage() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreams();
    const interval = setInterval(loadStreams, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadStreams = async () => {
    try {
      const data = await streamingApi.getLiveStreams();
      setStreams(data);
    } catch (error) {
      console.error('Error loading streams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando transmisiones en vivo...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Radio className="w-8 h-8 text-red-600" />
            En Vivo
          </h1>
          <p className="text-gray-600 mt-1">
            {streams.length} transmisión{streams.length !== 1 ? 'es' : ''} en vivo
          </p>
        </div>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
          <Radio className="w-5 h-5" />
          Transmitir
        </button>
      </div>

      {/* Live Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <Radio className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay transmisiones en vivo en este momento</p>
            <p className="text-sm mt-2">Sé el primero en transmitir</p>
          </div>
        ) : (
          streams.map((stream) => (
            <div
              key={stream.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-red-500 to-pink-500">
                {stream.thumbnail_url ? (
                  <img
                    src={stream.thumbnail_url}
                    alt={stream.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}

                {/* Live Badge */}
                <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  EN VIVO
                </div>

                {/* Viewer Count */}
                <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {stream.viewer_count || 0}
                </div>
              </div>

              {/* Stream Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{stream.title}</h3>

                {stream.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {stream.description}
                  </p>
                )}

                {/* Streamer Info */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm">
                    {stream.streamer_picture ? (
                      <img
                        src={stream.streamer_picture}
                        alt={stream.streamer_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      stream.streamer_name?.charAt(0) || 'S'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {stream.streamer_name || 'Streamer'}
                    </p>
                    {stream.started_at && (
                      <p className="text-xs text-gray-500">
                        Comenzó hace {getTimeAgo(stream.started_at)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}
