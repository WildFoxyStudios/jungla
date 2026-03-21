'use client';

import { useState, useEffect } from 'react';
import { postsApi, Post } from '@/lib/api-posts';
import { friendsApi } from '@/lib/api-friends';
import { reactionsApi } from '@/lib/api-posts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Filter, Calendar, UserPlus, Heart, MessageSquare, Share2, Edit3, Trash2, Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'post_created' | 'post_liked' | 'post_commented' | 'post_shared' | 'friend_added' | 'profile_updated' | 'photo_uploaded' | 'group_joined';
  description: string;
  timestamp: string;
  details?: any;
  icon: any;
}

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all_time');

  const filters = [
    { id: 'all', label: 'Toda la actividad' },
    { id: 'posts', label: 'Publicaciones' },
    { id: 'interactions', label: 'Interacciones' },
    { id: 'connections', label: 'Conexiones' },
    { id: 'groups', label: 'Grupos' },
  ];

  const dateRanges = [
    { id: 'today', label: 'Hoy' },
    { id: 'week', label: 'Esta semana' },
    { id: 'month', label: 'Este mes' },
    { id: 'year', label: 'Este año' },
    { id: 'all_time', label: 'Todo el tiempo' },
  ];

  useEffect(() => {
    loadActivities();
  }, [activeFilter, dateRange]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const allActivities: ActivityItem[] = [];

      // Get posts
      const posts = await postsApi.getFeed(20, 0);
      posts.forEach(post => {
        const content = post.content || '';
        allActivities.push({
          id: `post-${post.id}`,
          type: 'post_created',
          description: `Publicaste: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`,
          timestamp: post.created_at,
          details: post,
          icon: Edit3,
        });
      });

      // Get friends
      const friends = await friendsApi.getFriends({ limit: 10 }).catch(() => []);
      friends.forEach((friend: any) => {
        allActivities.push({
          id: `friend-${friend.id}`,
          type: 'friend_added',
          description: `Te hiciste amigo de ${friend.full_name}`,
          timestamp: friend.created_at,
          details: friend,
          icon: UserPlus,
        });
      });

      // Sort by timestamp desc
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Filter by date range
      const now = new Date();
      let cutoffDate = new Date(0);
      
      switch (dateRange) {
        case 'today':
          cutoffDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          cutoffDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      const filteredActivities = allActivities.filter(a => new Date(a.timestamp) >= cutoffDate);
      
      // Apply type filter
      const typeFiltered = activeFilter === 'all' 
        ? filteredActivities 
        : filteredActivities.filter(a => {
            switch (activeFilter) {
              case 'posts': return ['post_created', 'photo_uploaded'].includes(a.type);
              case 'interactions': return ['post_liked', 'post_commented', 'post_shared'].includes(a.type);
              case 'connections': return ['friend_added', 'profile_updated'].includes(a.type);
              case 'groups': return a.type === 'group_joined';
              default: return true;
            }
          });

      setActivities(typeFiltered);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) {
      const hours = Math.floor(diff / 3600000);
      if (hours === 0) {
        const mins = Math.floor(diff / 60000);
        return mins <= 1 ? 'Hace un momento' : `Hace ${mins} minutos`;
      }
      return `Hace ${hours} horas`;
    }
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post_created': return Edit3;
      case 'post_liked': return Heart;
      case 'post_commented': return MessageSquare;
      case 'post_shared': return Share2;
      case 'friend_added': return UserPlus;
      case 'photo_uploaded': return Edit3;
      case 'group_joined': return History;
      default: return History;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'post_created': return 'bg-blue-100 text-blue-600';
      case 'post_liked': return 'bg-red-100 text-red-600';
      case 'post_commented': return 'bg-green-100 text-green-600';
      case 'post_shared': return 'bg-purple-100 text-purple-600';
      case 'friend_added': return 'bg-yellow-100 text-yellow-600';
      case 'photo_uploaded': return 'bg-pink-100 text-pink-600';
      case 'group_joined': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const groupedActivities = activities.reduce((groups: { [key: string]: ActivityItem[] }, activity) => {
    const date = new Date(activity.timestamp);
    const dateKey = date.toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(activity);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 px-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Registro de actividad</h1>
            <p className="text-sm text-gray-600">Revisa y administra tu actividad</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-4 mx-4">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en tu actividad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {filters.map(filter => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className={activeFilter === filter.id ? 'bg-blue-600' : ''}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateRanges.map(range => (
                  <option key={range.id} value={range.id}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Activities */}
        <div className="px-4 space-y-4">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando actividad...</p>
            </Card>
          ) : activities.length === 0 ? (
            <Card className="p-12 text-center">
              <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold mb-2">No hay actividad registrada</h2>
              <p className="text-gray-600">
                Tu actividad aparecerá aquí cuando empieces a usar la aplicación
              </p>
            </Card>
          ) : (
            Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date}>
                <h3 className="font-semibold text-gray-600 mb-3 sticky top-0 bg-gray-100 py-2">
                  {date.charAt(0).toUpperCase() + date.slice(1)}
                </h3>
                <div className="space-y-2">
                  {dayActivities.map(activity => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <Card key={activity.id} className="p-4 hover:shadow-md transition">
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimestamp(activity.timestamp)}
                            </p>
                            
                            {/* Show details if it's a post with media */}
                            {activity.details?.media_urls?.length > 0 && (
                              <div className="mt-2 flex gap-2">
                                {activity.details.media_urls.slice(0, 3).map((url: string, idx: number) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt=""
                                    className="w-16 h-16 rounded object-cover"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-1">
                            {activity.type === 'post_created' && (
                              <>
                                <Link href={`/home`}>
                                  <Button variant="ghost" size="sm">
                                    Ver
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {activities.length > 0 && !loading && (
          <div className="text-center py-6">
            <Button variant="outline" onClick={() => {}}>
              Cargar más actividad
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
