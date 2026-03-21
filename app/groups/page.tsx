'use client';

import { useState, useEffect } from 'react';
import { groupApi, Group } from '@/lib/api-groups';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Search, Lock, Globe } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover'>('my-groups');
  const router = useRouter();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const [myGroups, allGroups] = await Promise.all([
        groupApi.getMyGroups({ limit: 50 }),
        groupApi.searchGroups('').catch(() => []),
      ]);
      setGroups(myGroups);
      setDiscoverGroups(allGroups.filter((g: Group) => !myGroups.find((mg: Group) => mg.id === g.id)));
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const token = localStorage.getItem('session_token');
      if (!token) return;
      await groupApi.joinGroup(groupId, token);
      await loadGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const results = await groupApi.searchGroups(searchQuery);
      setDiscoverGroups(results);
      setActiveTab('discover');
    } catch (error) {
      console.error('Error searching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayedGroups = activeTab === 'my-groups' ? groups : discoverGroups;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-4 px-4">
        <div className="grid grid-cols-4 gap-4">
          {/* Sidebar */}
          <div className="col-span-1">
            <Card className="p-4">
              <h2 className="font-bold text-xl mb-4">Grupos</h2>
              
              <Button 
                variant="ghost" 
                className={`w-full justify-start mb-2 ${activeTab === 'my-groups' ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => setActiveTab('my-groups')}
              >
                <Users className="w-5 h-5 mr-3" />
                Tus grupos
                <span className="ml-auto">{groups.length}</span>
              </Button>

              <Button 
                variant="ghost" 
                className={`w-full justify-start mb-4 ${activeTab === 'discover' ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => setActiveTab('discover')}
              >
                <Globe className="w-5 h-5 mr-3" />
                Descubrir
              </Button>

              <Link href="/groups/create">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear grupo
                </Button>
              </Link>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-3">
            <Card className="p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">
                  {activeTab === 'my-groups' ? 'Tus grupos' : 'Descubrir grupos'}
                </h1>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar grupos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button onClick={handleSearch}>Buscar</Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando grupos...</p>
                </div>
              ) : displayedGroups.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">
                    {activeTab === 'my-groups' 
                      ? 'No eres miembro de ningún grupo aún'
                      : 'No se encontraron grupos'}
                  </p>
                  {activeTab === 'my-groups' && (
                    <Button 
                      className="mt-4" 
                      onClick={() => setActiveTab('discover')}
                    >
                      Descubrir grupos
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {displayedGroups.map((group) => (
                    <div 
                      key={group.id} 
                      className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                      onClick={() => router.push(`/groups/${group.id}`)}
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-2xl font-bold">
                          {group.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg truncate">{group.name}</h3>
                            {group.privacy === 'private' && <Lock className="w-4 h-4 text-gray-500" />}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{group.description || 'Sin descripción'}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>{group.member_count || 0} miembros</span>
                            <span className="capitalize">{group.privacy}</span>
                          </div>
                          {activeTab === 'discover' && (
                            <Button 
                              size="sm" 
                              className="mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinGroup(group.id);
                              }}
                            >
                              Unirse
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
