'use client';

import { useState } from 'react';
import { Comment, commentsApi } from '@/lib/api-posts';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ThumbsUp, MessageCircle, Trash2, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import CommentForm from './CommentForm';

interface CommentCardProps {
  comment: Comment;
  onDelete: (commentId: string) => void;
  onUpdate: (comment: Comment) => void;
  isReply?: boolean;
}

export default function CommentCard({
  comment,
  onDelete,
  onUpdate,
  isReply = false,
}: CommentCardProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const loadReplies = async () => {
    if (replies.length > 0) {
      setShowReplies(!showReplies);
      return;
    }

    setLoadingReplies(true);
    try {
      const loadedReplies = await commentsApi.getReplies(comment.id);
      setReplies(loadedReplies);
      setShowReplies(true);
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este comentario?')) return;

    try {
      await commentsApi.deleteComment(comment.id);
      onDelete(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleUpdate = async () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    try {
      const updated = await commentsApi.updateComment(comment.id, editContent.trim());
      onUpdate(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleReplyAdded = (reply: Comment) => {
    setReplies((prev) => [reply, ...prev]);
    setShowReplyForm(false);
    setShowReplies(true);
  };

  const handleReplyDeleted = (replyId: string) => {
    setReplies((prev) => prev.filter((r) => r.id !== replyId));
  };

  return (
    <div className={`flex gap-2 ${isReply ? 'ml-8' : ''}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-2xl px-3 py-2">
          <div className="font-semibold text-sm">Usuario</div>
          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleUpdate}>
                  Guardar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-3 mt-1 px-3">
            <button className="text-xs font-semibold text-gray-600 hover:underline">
              Me gusta
            </button>
            {!isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs font-semibold text-gray-600 hover:underline"
              >
                Responder
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-gray-600 hover:underline"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Eliminar
            </button>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </div>
        )}

        {/* Replies count */}
        {!isReply && comment.replies_count > 0 && (
          <button
            onClick={loadReplies}
            className="text-xs font-semibold text-blue-600 hover:underline mt-2 px-3 flex items-center gap-1"
          >
            <MessageCircle className="w-3 h-3" />
            {showReplies ? 'Ocultar' : 'Ver'} {comment.replies_count}{' '}
            {comment.replies_count === 1 ? 'respuesta' : 'respuestas'}
          </button>
        )}

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-2">
            <CommentForm
              postId={comment.post_id}
              parentCommentId={comment.id}
              onCommentAdded={handleReplyAdded}
              placeholder="Escribe una respuesta..."
              compact
            />
          </div>
        )}

        {/* Replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                onDelete={handleReplyDeleted}
                onUpdate={onUpdate}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
