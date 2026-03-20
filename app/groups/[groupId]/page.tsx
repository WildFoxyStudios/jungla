'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { groupApi, type GroupPost } from '@/lib/api-groups';
import { Users, Image as ImageIcon, Send, Settings } from 'lucide-react';

export default function GroupPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [postContent, setPostContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [groupId]);

  const loadPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await groupApi.getGroupPosts(groupId, token);
      setPosts(data);
    } catch (error) {
      console.error('Error loading group posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await groupApi.createGroupPost(groupId, { content: postContent }, token);
      setPostContent('');
      await loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando grupo...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Group Header */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg" />
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Nombre del Grupo</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  1.2K miembros
                </span>
                <span>· Grupo público</span>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuración
            </button>
          </div>
        </div>
      </div>

      {/* Create Post */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <form onSubmit={handleCreatePost}>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="¿Qué quieres compartir con el grupo?"
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:border-blue-500"
            rows={3}
          />
          <div className="flex justify-between items-center mt-3">
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ImageIcon className="w-6 h-6 text-gray-600" />
            </button>
            <button
              type="submit"
              disabled={!postContent.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Publicar
            </button>
          </div>
        </form>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay publicaciones en este grupo</p>
            <p className="text-sm mt-2">Sé el primero en compartir algo</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
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
                <div className="grid grid-cols-2 gap-2 mb-4">
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
