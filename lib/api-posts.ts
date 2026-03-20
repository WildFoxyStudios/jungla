import { api } from './api';

export interface Post {
  id: string;
  user_id: string;
  group_id?: string;
  page_id?: string;
  event_id?: string;
  content?: string;
  media_urls: string[];
  media_metadata: Record<string, unknown>;
  location?: string;
  location_lat?: number;
  location_lng?: number;
  feeling?: string;
  activity?: string;
  tagged_users: string[];
  background_color?: string;
  visibility: string;
  custom_audience_lists: string[];
  is_pinned: boolean;
  is_archived: boolean;
  shares_count: number;
  reactions_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreatePostData {
  content?: string;
  media_urls?: string[];
  location?: string;
  location_lat?: number;
  location_lng?: number;
  feeling?: string;
  activity?: string;
  tagged_users?: string[];
  background_color?: string;
  visibility?: string;
  custom_audience_lists?: string[];
  group_id?: string;
  page_id?: string;
  event_id?: string;
}

export interface UpdatePostData {
  content?: string;
  location?: string;
  feeling?: string;
  activity?: string;
  tagged_users?: string[];
  visibility?: string;
}

export interface ReactionSummary {
  total: number;
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
  care: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  media_url?: string;
  media_type?: string;
  sticker_id?: string;
  gif_url?: string;
  reactions_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateCommentData {
  content: string;
  media_url?: string;
  media_type?: string;
  sticker_id?: string;
  gif_url?: string;
  parent_comment_id?: string;
}

export interface Share {
  id: string;
  post_id: string;
  user_id: string;
  shared_with_comment?: string;
  original_post_id?: string;
  visibility: string;
  shared_at: string;
}

// Posts API
export const postsApi = {
  async createPost(data: CreatePostData): Promise<Post> {
    const response = await api.post('/posts', data);
    return response.data;
  },

  async getFeed(limit = 20, offset = 0): Promise<Post[]> {
    const response = await api.get('/posts/feed', { params: { limit, offset } });
    return response.data;
  },

  async getPost(postId: string): Promise<Post> {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  async updatePost(postId: string, data: UpdatePostData): Promise<Post> {
    const response = await api.put(`/posts/${postId}`, data);
    return response.data;
  },

  async deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`);
  },

  async pinPost(postId: string): Promise<Post> {
    const response = await api.post(`/posts/${postId}/pin`);
    return response.data;
  },

  async savePost(postId: string): Promise<void> {
    await api.post(`/posts/${postId}/save`);
  },

  async unsavePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}/save`);
  },

  async getSavedPosts(limit = 20, offset = 0): Promise<Post[]> {
    const response = await api.get('/posts/saved', { params: { limit, offset } });
    return response.data;
  },

  async hidePost(postId: string): Promise<void> {
    await api.post(`/posts/${postId}/hide`);
  },

  async reportPost(postId: string, reason: string, description?: string): Promise<void> {
    await api.post(`/posts/${postId}/report`, { reason, description });
  },

  async getUserPosts(userId: string, limit = 20, offset = 0): Promise<Post[]> {
    const response = await api.get(`/posts/user/${userId}`, { params: { limit, offset } });
    return response.data;
  },
};

// Reactions API
export const reactionsApi = {
  async reactToPost(postId: string, reactionType: string): Promise<void> {
    await api.post(`/posts/${postId}/reactions`, { reaction_type: reactionType });
  },

  async removeReaction(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}/reactions`);
  },

  async getPostReactions(postId: string, limit = 50, offset = 0, reactionType?: string) {
    const response = await api.get(`/posts/${postId}/reactions`, {
      params: { limit, offset, reaction_type: reactionType },
    });
    return response.data;
  },

  async getReactionsSummary(postId: string): Promise<ReactionSummary> {
    const response = await api.get(`/posts/${postId}/reactions/summary`);
    return response.data;
  },
};

// Comments API
export const commentsApi = {
  async createComment(postId: string, data: CreateCommentData): Promise<Comment> {
    const response = await api.post(`/posts/${postId}/comments`, data);
    return response.data;
  },

  async getComments(postId: string, limit = 20, offset = 0): Promise<Comment[]> {
    const response = await api.get(`/posts/${postId}/comments`, { params: { limit, offset } });
    return response.data;
  },

  async getReplies(commentId: string, limit = 20, offset = 0): Promise<Comment[]> {
    const response = await api.get(`/comments/${commentId}/replies`, { params: { limit, offset } });
    return response.data;
  },

  async updateComment(commentId: string, content: string): Promise<Comment> {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data;
  },

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  },

  async reactToComment(commentId: string, reactionType: string): Promise<void> {
    await api.post(`/comments/${commentId}/reactions`, { reaction_type: reactionType });
  },

  async removeCommentReaction(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}/reactions`);
  },

  async getCommentReactions(commentId: string) {
    const response = await api.get(`/comments/${commentId}/reactions`);
    return response.data;
  },
};

// Shares API
export const sharesApi = {
  async sharePost(postId: string, sharedWithComment?: string, visibility?: string): Promise<Share> {
    const response = await api.post(`/posts/${postId}/share`, {
      shared_with_comment: sharedWithComment,
      visibility,
    });
    return response.data;
  },

  async getPostShares(postId: string) {
    const response = await api.get(`/posts/${postId}/shares`);
    return response.data;
  },

  async deleteShare(shareId: string): Promise<void> {
    await api.delete(`/shares/${shareId}`);
  },
};
