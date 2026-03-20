import { api } from './api';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  profile_picture_url?: string;
  cover_photo_url?: string;
  bio?: string;
  work_current?: string;
  work_position?: string;
  education_current?: string;
  location_city?: string;
  location_country?: string;
  website?: string;
  birth_date?: string;
  gender?: string;
  languages: string[];
  relationship_status?: string;
  phone_number?: string;
  profile_views_count: number;
  created_at: string;
}

export interface UserPhoto {
  id: string;
  user_id: string;
  url: string;
  caption?: string;
  album_type: string;
  album_name?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface Education {
  id: string;
  user_id: string;
  school_name: string;
  degree?: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  is_current: boolean;
  description?: string;
  created_at: string;
}

export interface Work {
  id: string;
  user_id: string;
  company_name: string;
  position: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  created_at: string;
}

export interface PlaceLived {
  id: string;
  user_id: string;
  city: string;
  country: string;
  place_type: string;
  start_year?: number;
  end_year?: number;
  created_at: string;
}

export interface Interest {
  id: string;
  user_id: string;
  category: string;
  interest_name: string;
  created_at: string;
}

export interface ProfileStats {
  friends_count: number;
  posts_count: number;
  photos_count: number;
  profile_views_count: number;
}

export interface CompleteProfile {
  user: UserProfile;
  stats: ProfileStats;
  photos: UserPhoto[];
  education: Education[];
  work: Work[];
  places_lived: PlaceLived[];
  interests: Interest[];
}

export const profileApi = {
  async getProfile(userId: string): Promise<CompleteProfile> {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.put('/profile', data);
    return response.data;
  },

  async updateProfilePicture(url: string): Promise<void> {
    await api.post('/profile/picture', url);
  },

  async updateCoverPhoto(url: string): Promise<void> {
    await api.post('/profile/cover', url);
  },

  async addPhoto(data: { url: string; caption?: string; album_type: string; album_name?: string }): Promise<UserPhoto> {
    const response = await api.post('/profile/photos', data);
    return response.data;
  },

  async getUserPhotos(userId: string): Promise<UserPhoto[]> {
    const response = await api.get(`/profile/photos/${userId}`);
    return response.data;
  },

  async deletePhoto(photoId: string): Promise<void> {
    await api.delete(`/profile/photos/${photoId}`);
  },

  async addEducation(data: Partial<Education>): Promise<Education> {
    const response = await api.post('/profile/education', data);
    return response.data;
  },

  async deleteEducation(educationId: string): Promise<void> {
    await api.delete(`/profile/education/${educationId}`);
  },

  async addWork(data: Partial<Work>): Promise<Work> {
    const response = await api.post('/profile/work', data);
    return response.data;
  },

  async deleteWork(workId: string): Promise<void> {
    await api.delete(`/profile/work/${workId}`);
  },

  async addPlace(data: Partial<PlaceLived>): Promise<PlaceLived> {
    const response = await api.post('/profile/places', data);
    return response.data;
  },

  async deletePlace(placeId: string): Promise<void> {
    await api.delete(`/profile/places/${placeId}`);
  },

  async addInterest(data: { category: string; interest_name: string }): Promise<Interest> {
    const response = await api.post('/profile/interests', data);
    return response.data;
  },

  async deleteInterest(interestId: string): Promise<void> {
    await api.delete(`/profile/interests/${interestId}`);
  },
};
