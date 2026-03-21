import { api } from './api';

export interface Page {
  id: string;
  name: string;
  category: string;
  description?: string;
  profile_picture_url?: string;
  cover_photo_url?: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: Record<string, string>;
  verified: boolean;
  followers_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePageRequest {
  name: string;
  category: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface PagePost {
  id: string;
  page_id: string;
  user_id: string;
  content?: string;
  media_urls: string[];
  reactions_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
}

export interface PageReview {
  id: string;
  page_id: string;
  user_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
}

export const pagesApi = {
  async createPage(data: CreatePageRequest): Promise<Page> {
    const response = await api.post('/pages', data);
    return response.data;
  },

  async getPage(pageId: string): Promise<Page> {
    const response = await api.get(`/pages/${pageId}`);
    return response.data;
  },

  async updatePage(pageId: string, data: Partial<CreatePageRequest>): Promise<Page> {
    const response = await api.put(`/pages/${pageId}`, data);
    return response.data;
  },

  async deletePage(pageId: string): Promise<void> {
    await api.delete(`/pages/${pageId}`);
  },

  async followPage(pageId: string): Promise<void> {
    await api.post(`/pages/${pageId}/follow`);
  },

  async unfollowPage(pageId: string): Promise<void> {
    await api.delete(`/pages/${pageId}/follow`);
  },

  async getPagePosts(pageId: string, limit = 20, offset = 0): Promise<PagePost[]> {
    const response = await api.get(`/pages/${pageId}/posts`, { params: { limit, offset } });
    return response.data;
  },

  async createPagePost(pageId: string, content: string, mediaUrls?: string[]): Promise<PagePost> {
    const response = await api.post(`/pages/${pageId}/posts`, {
      content,
      media_urls: mediaUrls,
    });
    return response.data;
  },

  async getPageReviews(pageId: string, limit = 20, offset = 0): Promise<PageReview[]> {
    const response = await api.get(`/pages/${pageId}/reviews`, { params: { limit, offset } });
    return response.data;
  },

  async createPageReview(pageId: string, rating: number, reviewText?: string): Promise<PageReview> {
    const response = await api.post(`/pages/${pageId}/reviews`, {
      rating,
      review_text: reviewText,
    });
    return response.data;
  },

  async searchPages(query: string, category?: string): Promise<Page[]> {
    const response = await api.get('/pages/search', {
      params: { q: query, category },
    });
    return response.data;
  },

  async getFollowedPages(): Promise<Page[]> {
    const response = await api.get('/pages/following');
    return response.data;
  },
};
