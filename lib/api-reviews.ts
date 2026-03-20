import { API_URL } from './api';

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_picture?: string;
  rating: number;
  title?: string;
  review_text?: string;
  verified_purchase: boolean;
  helpful_count: number;
  not_helpful_count: number;
  images: string[];
  created_at: string;
}

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  review_text?: string;
  images?: string[];
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

export const reviewsApi = {
  // Crear review
  createReview: async (productId: string, data: CreateReviewRequest): Promise<ProductReview> => {
    const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create review');
    return res.json();
  },

  // Obtener reviews de producto
  getProductReviews: async (
    productId: string,
    filters?: {
      rating?: number;
      verified_only?: boolean;
      sort?: 'recent' | 'helpful' | 'rating_high' | 'rating_low';
      limit?: number;
      offset?: number;
    }
  ): Promise<ProductReview[]> => {
    const params = new URLSearchParams();
    if (filters?.rating) params.append('rating', filters.rating.toString());
    if (filters?.verified_only) params.append('verified_only', 'true');
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const res = await fetch(`${API_URL}/products/${productId}/reviews?${params.toString()}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  // Votar review
  voteReview: async (reviewId: string, isHelpful: boolean): Promise<{ helpful_count: number; not_helpful_count: number }> => {
    const res = await fetch(`${API_URL}/reviews/${reviewId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ is_helpful: isHelpful }),
    });
    if (!res.ok) throw new Error('Failed to vote review');
    return res.json();
  },

  // Obtener resumen de reviews
  getReviewSummary: async (productId: string): Promise<ReviewSummary> => {
    const res = await fetch(`${API_URL}/products/${productId}/reviews/summary`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch review summary');
    return res.json();
  },
};
