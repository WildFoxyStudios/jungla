'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { profileApi, CompleteProfile } from '@/lib/api-profile';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { Card } from '@/components/ui/card';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompleteProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando perfil...</div>
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
          <div className="col-span-2">
            <Card className="p-4">
              <h2 className="font-bold text-xl mb-4">Publicaciones</h2>
              <p className="text-gray-500 text-center py-8">No hay publicaciones aún</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
