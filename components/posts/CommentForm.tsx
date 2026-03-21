'use client';

import { useState } from 'react';
import { commentsApi, Comment } from '@/lib/api-posts';
import { Button } from '@/components/ui/button';
import { Smile, Image } from 'lucide-react';

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  onCommentAdded: (comment: Comment) => void;
  placeholder?: string;
  compact?: boolean;
}

export default function CommentForm({
  postId,
  parentCommentId,
  onCommentAdded,
  placeholder = 'Escribe un comentario...',
  compact = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment = await commentsApi.createComment(postId, {
        content: content.trim(),
        parent_comment_id: parentCommentId,
      });
      onCommentAdded(comment);
      setContent('');
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
      <div className="flex-1">
        <div className="bg-gray-100 rounded-3xl px-4 py-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none resize-none text-sm"
            rows={compact ? 1 : 2}
            disabled={isSubmitting}
          />
        </div>
        {!compact && content.trim() && (
          <div className="flex items-center justify-between mt-2 px-2">
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm">
                <Smile className="w-4 h-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm">
                <Image className="w-4 h-4" />
              </Button>
            </div>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Comentar'}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
