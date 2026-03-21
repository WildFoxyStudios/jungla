import { api } from './api';

export interface SearchResults {
  users: SearchUser[];
  posts: SearchPost[];
  pages: SearchPage[];
  groups: SearchGroup[];
  products: SearchProduct[];
}

export interface SearchUser {
  id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  bio?: string;
  mutual_friends_count: number;
}

export interface SearchPost {
  id: string;
  user_id: string;
  content?: string;
  media_urls: string[];
  reactions_count: number;
  comments_count: number;
  created_at: string;
}

export interface SearchPage {
  id: string;
  name: string;
  category: string;
  profile_picture_url?: string;
  followers_count: number;
  verified: boolean;
}

export interface SearchGroup {
  id: string;
  name: string;
  description?: string;
  profile_picture_url?: string;
  members_count: number;
  privacy: string;
}

export interface SearchProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  condition: string;
}

export const searchApi = {
  async search(
    query: string,
    filters?: {
      type?: 'all' | 'users' | 'posts' | 'pages' | 'groups' | 'products';
      limit?: number;
    }
  ): Promise<SearchResults> {
    const response = await api.get('/search', {
      params: {
        q: query,
        type: filters?.type || 'all',
        limit: filters?.limit || 10,
      },
    });
    return response.data;
  },

  async searchUsers(query: string, limit = 20): Promise<SearchUser[]> {
    const response = await api.get('/search/users', {
      params: { q: query, limit },
    });
    return response.data;
  },

  async searchPosts(query: string, limit = 20): Promise<SearchPost[]> {
    const response = await api.get('/search/posts', {
      params: { q: query, limit },
    });
    return response.data;
  },

  async searchPages(query: string, limit = 20): Promise<SearchPage[]> {
    const response = await api.get('/search/pages', {
      params: { q: query, limit },
    });
    return response.data;
  },

  async searchGroups(query: string, limit = 20): Promise<SearchGroup[]> {
    const response = await api.get('/search/groups', {
      params: { q: query, limit },
    });
    return response.data;
  },

  async searchProducts(query: string, limit = 20): Promise<SearchProduct[]> {
    const response = await api.get('/search/products', {
      params: { q: query, limit },
    });
    return response.data;
  },
};
