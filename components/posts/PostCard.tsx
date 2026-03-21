'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Post } from '@/lib/api-posts';
import { MoreHorizontal, MessageCircle, Share2 } from 'lucide-react';
import ReactionPicker from './ReactionPicker';
import CommentSection from './CommentSection';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface PostCardProps {
  post: Post;
  onReact?: (reactionType: string) => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function PostCard({ post, onReact, onComment, onShare }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <Card className="mb-4 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              U
            </div>
            <div>
              <div className="font-semibold">Usuario</div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                {' · '}
                {post.visibility === 'public' ? '🌍' : post.visibility === 'friends' ? '👥' : '🔒'}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        {post.content && (
          <div className="mt-3 text-sm whitespace-pre-wrap">{post.content}</div>
        )}

        {post.feeling && (
          <div className="mt-2 text-sm text-gray-600">
            está sintiéndose <span className="font-medium">{post.feeling}</span>
          </div>
        )}

        {post.location && (
          <div className="mt-1 text-sm text-gray-600">
            en <span className="font-medium">{post.location}</span>
          </div>
        )}
      </div>

      {/* Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className="relative bg-black">
          <img
            src={post.media_urls[0]}
            alt="Post media"
            className="w-full max-h-[500px] object-contain"
          />
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-1">
          {post.reactions_count > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                <span className="text-base">👍</span>
                <span className="text-base">❤️</span>
              </div>
              <span>{post.reactions_count}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {post.comments_count > 0 && (
            <span>{post.comments_count} comentarios</span>
          )}
          {post.shares_count > 0 && (
            <span>{post.shares_count} veces compartido</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-b px-2 py-1">
        <div className="flex items-center justify-around">
          <ReactionPicker onReact={onReact || (() => {})} />
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => {
              setShowComments(!showComments);
              onComment?.();
            }}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Comentar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={onShare}
          >
            <Share2 className="w-5 h-5" />
            <span className="font-medium">Compartir</span>
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="p-4 bg-gray-50">
          <CommentSection postId={post.id} commentsCount={post.comments_count} />
        </div>
      )}
    </Card>
  );
}
