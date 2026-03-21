'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { profileApi, CompleteProfile } from '@/lib/api-profile';
import { postsApi, Post } from '@/lib/api-posts';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PostCard from '@/components/posts/PostCard';
import PostCreator from '@/components/posts/PostCreator';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompleteProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  useEffect(() => {
    const handlePostCreated = () => {
      loadProfileData();
    };
    window.addEventListener('post-created', handlePostCreated);
    return () => window.removeEventListener('post-created', handlePostCreated);
  }, [userId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setPostsLoading(true);
      
      const [profileData, postsData] = await Promise.all([
        profileApi.getProfile(userId),
        postsApi.getUserPosts(userId, 20, 0),
      ]);
      
      setProfile(profileData);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
      setPostsLoading(false);
    }
  };

  const handlePostCreated = () => {
    loadProfileData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Perfil no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto py-4">
        <ProfileHeader
          profile={profile.user}
          isOwnProfile={isOwnProfile}
          onEditCover={() => console.log('Edit cover')}
          onEditPhoto={() => console.log('Edit photo')}
        />

        <div className="grid grid-cols-3 gap-4">
          {/* Left Column - About */}
          <div className="col-span-1 space-y-4">
            <Card className="p-4">
              <h2 className="font-bold text-xl mb-4">Acerca de</h2>
              
              {profile.work.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Trabajo</h3>
                  {profile.work.map(w => (
                    <div key={w.id} className="text-sm mb-2">
                      <div className="font-medium">{w.position}</div>
                      <div className="text-gray-600">{w.company_name}</div>
                    </div>
                  ))}
                </div>
              )}

              {profile.education.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Educación</h3>
                  {profile.education.map(e => (
                    <div key={e.id} className="text-sm mb-2">
                      <div className="font-medium">{e.school_name}</div>
                      {e.degree && <div className="text-gray-600">{e.degree}</div>}
                    </div>
                  ))}
                </div>
              )}

              {profile.places_lived.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Lugares</h3>
                  {profile.places_lived.map(p => (
                    <div key={p.id} className="text-sm mb-2">
                      {p.city}, {p.country}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Visitas al perfil</span>
                  <span className="font-semibold">{profile.stats.profile_views_count}</span>
                </div>
              </div>
            </Card>

            {profile.photos.length > 0 && (
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-xl">Fotos</h2>
                  <span className="text-blue-600 text-sm cursor-pointer">Ver todas</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {profile.photos.slice(0, 9).map(photo => (
                    <div key={photo.id} className="aspect-square bg-gray-200 rounded overflow-hidden">
                      <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Posts */}
          <div className="col-span-2 space-y-4">
            {isOwnProfile && <PostCreator />}
            
            {postsLoading ? (
              <Card className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="mt-2 text-gray-600">Cargando publicaciones...</p>
              </Card>
            ) : posts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No hay publicaciones aún</p>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onReact={(type) => console.log('React:', type)}
                  onComment={() => console.log('Comment')}
                  onShare={() => console.log('Share')}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
