'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { TrendingUp, Users, Heart, MessageCircle, Share2, Eye, BarChart3 } from 'lucide-react';

interface AnalyticsDashboardProps {
  pageId: string;
}

interface PageAnalytics {
  date: string;
  page_views: number;
  unique_visitors: number;
  new_likes: number;
  post_engagements: number;
  reactions: number;
  comments: number;
  shares: number;
}

interface AnalyticsSummary {
  total_reach: number;
  total_engagement: number;
  total_followers: number;
  growth_rate: number;
}

export default function AnalyticsDashboard({ pageId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<PageAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dateRange, setDateRange] = useState('30'); // días
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    loadSummary();
  }, [pageId, dateRange]);

  const loadAnalytics = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const res = await fetch(
        `${API_URL}/pages/${pageId}/analytics?start_date=${startDate}&end_date=${endDate}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const res = await fetch(`${API_URL}/pages/${pageId}/analytics/summary`, {
        credentials: 'include',
      });
      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const totalViews = analytics.reduce((sum, day) => sum + day.page_views, 0);
  const totalVisitors = analytics.reduce((sum, day) => sum + day.unique_visitors, 0);
  const totalEngagement = analytics.reduce((sum, day) => sum + day.post_engagements, 0);
  const avgEngagementRate = totalVisitors > 0 ? ((totalEngagement / totalVisitors) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
        </select>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Alcance Total"
          value={totalVisitors.toLocaleString()}
          icon={<Eye className="w-6 h-6" />}
          color="blue"
          change={summary?.growth_rate}
        />
        <MetricCard
          title="Vistas de Página"
          value={totalViews.toLocaleString()}
          icon={<BarChart3 className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Engagement"
          value={totalEngagement.toLocaleString()}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          title="Tasa de Engagement"
          value={`${avgEngagementRate}%`}
          icon={<Heart className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Seguidores */}
      {summary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Seguidores
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {summary.total_followers.toLocaleString()}
              </div>
              <div className="text-gray-600">Total de seguidores</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                +{summary.growth_rate.toFixed(1)}%
              </div>
              <div className="text-gray-600">Crecimiento</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {(summary.total_engagement / 1000).toFixed(1)}k
              </div>
              <div className="text-gray-600">Interacciones</div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfica de actividad */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Actividad Diaria</h2>
        <div className="space-y-2">
          {analytics.slice(0, 14).reverse().map((day) => {
            const maxValue = Math.max(...analytics.map((d) => d.page_views));
            const percentage = (day.page_views / maxValue) * 100;

            return (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('es-MX', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-3 text-sm font-semibold">
                      {day.page_views} vistas
                    </div>
                  </div>
                </div>
                <div className="w-32 text-sm text-gray-600">
                  {day.unique_visitors} visitantes
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engagement breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Desglose de Engagement</h2>
        <div className="grid grid-cols-3 gap-4">
          <EngagementStat
            icon={<Heart className="w-5 h-5" />}
            label="Reacciones"
            value={analytics.reduce((sum, d) => sum + d.reactions, 0)}
            color="red"
          />
          <EngagementStat
            icon={<MessageCircle className="w-5 h-5" />}
            label="Comentarios"
            value={analytics.reduce((sum, d) => sum + d.comments, 0)}
            color="blue"
          />
          <EngagementStat
            icon={<Share2 className="w-5 h-5" />}
            label="Compartidos"
            value={analytics.reduce((sum, d) => sum + d.shares, 0)}
            color="green"
          />
        </div>
      </div>

      {/* Top posts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Mejores Publicaciones</h2>
        <div className="text-center text-gray-500 py-8">
          Próximamente: Top posts con más engagement
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'red';
  change?: number;
}

function MetricCard({ title, value, icon, color, change }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        {change !== undefined && (
          <div className={`text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}
            {change.toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-gray-600 text-sm">{title}</div>
    </div>
  );
}

interface EngagementStatProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function EngagementStat({ icon, label, value, color }: EngagementStatProps) {
  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${color}-100 text-${color}-600 mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}
