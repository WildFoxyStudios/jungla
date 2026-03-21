'use client';

import { useState, useEffect } from 'react';
import { commentsApi, Comment } from '@/lib/api-posts';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  commentsCount: number;
}

export default function CommentSection({ postId, commentsCount }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const newComments = await commentsApi.getComments(postId, limit, offset);
      setComments((prev) => [...prev, ...newComments]);
      setHasMore(newComments.length === limit);
      setOffset((prev) => prev + newComments.length);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (comment: Comment) => {
    setComments((prev) => [comment, ...prev]);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
    );
  };

  return (
    <div className="space-y-3">
      {/* Comment Form */}
      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onDelete={handleCommentDeleted}
            onUpdate={handleCommentUpdated}
          />
        ))}
      </div>

      {/* Load More */}
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {!loading && hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={loadComments}
          className="w-full"
        >
          Cargar más comentarios
        </Button>
      )}

      {!loading && comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Sé el primero en comentar
        </div>
      )}
    </div>
  );
}
