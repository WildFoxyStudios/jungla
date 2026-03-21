'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { groupApi, Group, GroupPost } from '@/lib/api-groups';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Image as ImageIcon, Send, Settings, Lock, Globe, Eye, ArrowLeft, UserPlus, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function GroupPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const router = useRouter();
  const { user } = useAuth();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [postContent, setPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('session_token');
      if (!token) return;

      const [groupData, postsData, myGroups] = await Promise.all([
        groupApi.getGroup(groupId, token),
        groupApi.getGroupPosts(groupId, token),
        groupApi.getMyGroups({}, token),
      ]);

      setGroup(groupData);
      setPosts(postsData);
      
      const memberStatus = myGroups.some((g: Group) => g.id === groupId);
      setIsMember(memberStatus);
      setIsAdmin(groupData.created_by === user?.id);
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    try {
      const token = localStorage.getItem('session_token');
      if (!token) return;

      await groupApi.createGroupPost(groupId, { content: postContent }, token);
      setPostContent('');
      await loadGroupData();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const token = localStorage.getItem('session_token');
      if (!token) return;

      await groupApi.joinGroup(groupId, token);
      await loadGroupData();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const token = localStorage.getItem('session_token');
      if (!token) return;

      await groupApi.leaveGroup(groupId, token);
      router.push('/groups');
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const getPrivacyIcon = () => {
    switch (group?.privacy) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      case 'secret': return <Eye className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getPrivacyLabel = () => {
    switch (group?.privacy) {
      case 'public': return 'Grupo público';
      case 'private': return 'Grupo privado';
      case 'secret': return 'Grupo secreto';
      default: return 'Grupo';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Grupo no encontrado</h1>
          <Link href="/groups">
            <Button>Ver todos los grupos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-4 px-4">
        <Link href="/groups">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a grupos
          </Button>
        </Link>

        {/* Group Header */}
        <Card className="mb-4 overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500" />
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {group.member_count || 0} miembros
                  </span>
                  <span className="flex items-center gap-1">
                    {getPrivacyIcon()}
                    {getPrivacyLabel()}
                  </span>
                </div>
                {group.description && (
                  <p className="mt-3 text-gray-700">{group.description}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                {isAdmin && (
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configuración
                  </Button>
                )}
                
                {!isMember ? (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    onClick={handleJoinGroup}
                  >
                    <UserPlus className="w-4 h-4" />
                    Unirse al grupo
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                    onClick={handleLeaveGroup}
                  >
                    <LogOut className="w-4 h-4" />
                    Salir del grupo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {isMember && (
          <>
            {/* Create Post */}
            <Card className="p-4 mb-4">
              <form onSubmit={handleCreatePost}>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="¿Qué quieres compartir con el grupo?"
                  className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="w-5 h-5 text-gray-600" />
                    Foto/Video
                  </Button>
                  <Button
                    type="submit"
                    disabled={!postContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Publicar
                  </Button>
                </div>
              </form>
            </Card>

            {/* Posts */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <Card className="p-12 text-center text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No hay publicaciones en este grupo</p>
                  <p className="text-sm mt-2">Sé el primero en compartir algo</p>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="p-6">
                    <div className="flex gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.author_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold">{post.author_name || 'Usuario'}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <p className="mb-4">{post.content}</p>
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {post.media_urls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt="Post media"
                            className="w-full rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {!isMember && (
          <Card className="p-8 text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">Únete al grupo para ver las publicaciones</h2>
            <p className="text-gray-600 mb-4">Los miembros del grupo pueden ver y compartir publicaciones</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleJoinGroup}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Unirse al grupo
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
