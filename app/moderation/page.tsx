'use client';

import { useEffect, useState } from 'react';
import { Shield, Check, X, Eye, Trash2, Filter } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface ModerationItem {
  id: string;
  content_type: string;
  content_id: string;
  flagged: boolean;
  action_taken: string;
  scores: any;
  categories: any;
  created_at: string;
  content_preview?: string;
}

interface ModerationStats {
  total_flagged: number;
  pending_review: number;
  hidden: number;
  deleted: number;
  by_category: any;
}

export default function ModerationPanel() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'flagged'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const [itemsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/moderation?status=${filter}`, { credentials: 'include' }),
        fetch(`${API_URL}/moderation/stats`, { credentials: 'include' }),
      ]);

      const itemsData = await itemsRes.json();
      const statsData = await statsRes.json();

      setItems(itemsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (itemId: string, action: 'approve' | 'hide' | 'delete') => {
    try {
      await fetch(`${API_URL}/moderation/${itemId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });

      await loadData();
    } catch (error) {
      console.error('Error reviewing item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Panel de Moderación</h1>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-red-600">
                  {stats.total_flagged}
                </div>
                <div className="text-gray-600">Detectados</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.pending_review}
                </div>
                <div className="text-gray-600">Pendientes</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">
                  {stats.hidden}
                </div>
                <div className="text-gray-600">Ocultos</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-red-700">
                  {stats.deleted}
                </div>
                <div className="text-gray-600">Eliminados</div>
              </div>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilter('flagged')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'flagged'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Detectados
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
          </div>
        </div>

        {/* Lista de contenido */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay contenido para revisar</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gray-100 px-3 py-1 rounded text-sm font-semibold">
                        {item.content_type}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(item.created_at).toLocaleString('es-MX')}
                      </span>
                    </div>

                    {/* Vista previa del contenido */}
                    <div className="bg-gray-50 p-4 rounded mb-4">
                      <p className="text-gray-800 line-clamp-3">
                        {item.content_preview || 'Sin vista previa disponible'}
                      </p>
                    </div>

                    {/* Scores de moderación */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {Object.entries(item.categories || {}).map(([category, flagged]) => (
                        flagged ? (
                          <div
                            key={category}
                            className="bg-red-50 px-3 py-2 rounded text-sm"
                          >
                            <span className="font-semibold text-red-700">{category}</span>
                            <span className="text-red-600 ml-2">
                              {((item.scores?.[category] || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                {item.action_taken === 'flagged' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleReview(item.id, 'approve')}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReview(item.id, 'hide')}
                      className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ocultar
                    </button>
                    <button
                      onClick={() => handleReview(item.id, 'delete')}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
