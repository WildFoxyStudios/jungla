'use client';

import { useState, useEffect } from 'react';
import { reviewsApi, type ProductReview, type ReviewSummary } from '@/lib/api-reviews';
import { Star, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [filter, setFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<'recent' | 'helpful' | 'rating_high' | 'rating_low'>('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
    loadSummary();
  }, [productId, filter, sort]);

  const loadReviews = async () => {
    try {
      const data = await reviewsApi.getProductReviews(productId, {
        rating: filter || undefined,
        sort,
        limit: 10,
      });
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await reviewsApi.getReviewSummary(productId);
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    try {
      await reviewsApi.voteReview(reviewId, isHelpful);
      await loadReviews();
    } catch (error) {
      console.error('Error voting review:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando reseñas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      {summary && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold">{summary.average_rating.toFixed(1)}</div>
              <div className="flex items-center justify-center my-2">
                <StarRating rating={summary.average_rating} size="lg" />
              </div>
              <div className="text-gray-600">{summary.total_reviews} reseñas</div>
            </div>

            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = (summary.rating_distribution as any)[stars] || 0;
                const percentage = summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0;
                
                return (
                  <div key={stars} className="flex items-center gap-2 mb-2">
                    <span className="text-sm w-12">{stars} ★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 flex-wrap">
            <select
              value={filter || ''}
              onChange={(e) => setFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">Todas las estrellas</option>
              <option value="5">5 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="2">2 estrellas</option>
              <option value="1">1 estrella</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="recent">Más recientes</option>
              <option value="helpful">Más útiles</option>
              <option value="rating_high">Calificación: Alta a Baja</option>
              <option value="rating_low">Calificación: Baja a Alta</option>
            </select>
          </div>
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay reseñas disponibles
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onVote={handleVote} />
          ))
        )}
      </div>
    </div>
  );
}

interface ReviewCardProps {
  review: ProductReview;
  onVote: (reviewId: string, isHelpful: boolean) => void;
}

function ReviewCard({ review, onVote }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start gap-4">
        <img
          src={review.user_picture || '/default-avatar.png'}
          alt={review.user_name}
          className="w-12 h-12 rounded-full"
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{review.user_name}</span>
            {review.verified_purchase && (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                Compra verificada
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={review.rating} size="sm" />
            {review.title && <span className="font-semibold">{review.title}</span>}
          </div>

          <p className="text-gray-700 mb-3">{review.review_text}</p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-3">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Review ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <button
              onClick={() => onVote(review.id, true)}
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <ThumbsUp className="w-4 h-4" />
              Útil ({review.helpful_count})
            </button>
            <button
              onClick={() => onVote(review.id, false)}
              className="flex items-center gap-1 hover:text-red-600"
            >
              <ThumbsDown className="w-4 h-4" />
              No útil ({review.not_helpful_count})
            </button>
            <span className="text-gray-400">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'lg';
}

function StarRating({ rating, size = 'sm' }: StarRatingProps) {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}
