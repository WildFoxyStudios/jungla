'use client';

import { UserProfile } from '@/lib/api-profile';
import { Button } from '@/components/ui/button';
import { Camera, UserPlus, MessageCircle } from 'lucide-react';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onEditCover?: () => void;
  onEditPhoto?: () => void;
}

export default function ProfileHeader({ profile, isOwnProfile, onEditCover, onEditPhoto }: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-96 bg-gradient-to-r from-blue-400 to-purple-500">
        {profile.cover_photo_url ? (
          <img src={profile.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-2xl">
            {profile.full_name}
          </div>
        )}
        {isOwnProfile && (
          <Button
            onClick={onEditCover}
            className="absolute bottom-4 right-4 bg-white text-gray-800 hover:bg-gray-100"
            size="sm"
          >
            <Camera className="w-4 h-4 mr-2" />
            Editar portada
          </Button>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-4">
        <div className="flex items-end justify-between -mt-16">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-40 h-40 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
              {profile.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-600">
                  {profile.full_name[0]}
                </div>
              )}
            </div>
            {isOwnProfile && (
              <button
                onClick={onEditPhoto}
                className="absolute bottom-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full p-2"
              >
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            {isOwnProfile ? (
              <Button className="bg-blue-600 hover:bg-blue-700">
                Editar perfil
              </Button>
            ) : (
              <>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Agregar amigo
                </Button>
                <Button variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Mensaje
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Name and Info */}
        <div className="mt-4">
          <h1 className="text-3xl font-bold">{profile.full_name}</h1>
          <p className="text-gray-600">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 text-gray-700">{profile.bio}</p>
          )}
          <div className="flex gap-4 mt-3 text-sm text-gray-600">
            {profile.location_city && (
              <span>📍 {profile.location_city}{profile.location_country && `, ${profile.location_country}`}</span>
            )}
            {profile.work_current && (
              <span>💼 {profile.work_position ? `${profile.work_position} en ` : ''}{profile.work_current}</span>
            )}
            {profile.education_current && (
              <span>🎓 {profile.education_current}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
