import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MessageCircle, Reply, Edit2, Trash2, Send } from 'lucide-react';
import { commentsApi, Comment, CommentAuthor } from '@/api/comments.api';
import { useAuth } from '@/context/AuthContext';

interface CommentSectionProps {
  courseId: string;
  isTeacher?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({ courseId, isTeacher = false }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContents, setReplyContents] = useState<{ [key: string]: string }>({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const replyRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  useEffect(() => {
    fetchComments();
  }, [courseId]);

  const fetchComments = async () => {
    try {
      const data = await commentsApi.getByCourse(courseId);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await commentsApi.create({
        content: newComment,
        courseId,
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyContentChange = useCallback((commentId: string, value: string) => {
    setReplyContents(prev => {
      const newState = { ...prev };
      newState[commentId] = value;
      return newState;
    });
  }, []);

  const handleReplyClick = (commentId: string) => {
    setReplyingTo(commentId);
  };

  const handleCreateReply = async (parentCommentId: string) => {
    // Get value directly from the textarea ref
    const textarea = replyRefs.current[parentCommentId];
    const replyContent = textarea?.value || '';
    
    console.log('Creating reply:', replyContent);
    if (!replyContent.trim()) return;

    setLoading(true);
    try {
      await commentsApi.create({
        content: replyContent,
        courseId,
        parentCommentId,
      });
      
      // Clear the reply content and close form
      setReplyContents(prev => ({ ...prev, [parentCommentId]: '' }));
      setReplyingTo(null);
      
      // Clear the textarea
      if (textarea) {
        textarea.value = '';
      }
      
      // Fetch comments in background without affecting current state
      fetchComments();
    } catch (error) {
      console.error('Failed to create reply:', error);
      // Don't clear the form on error, let user try again
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReply = (commentId: string) => {
    // Clear the textarea
    const textarea = replyRefs.current[commentId];
    if (textarea) {
      textarea.value = '';
    }
    setReplyContents(prev => ({ ...prev, [commentId]: '' }));
    setReplyingTo(null);
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      await commentsApi.update(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
      fetchComments();
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setLoading(true);
    try {
      await commentsApi.delete(commentId);
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEditOrDelete = (author: CommentAuthor) => {
    return author._id === user?.id || isTeacher;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
      <Card className={isReply ? 'bg-gray-50' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.avatar} />
                <AvatarFallback>
                  {comment.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{comment.author.name}</span>
                  <Badge variant={comment.author.role === 'TEACHER' ? 'default' : 'secondary'} className="text-xs">
                    {comment.author.role.toLowerCase()}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
              </div>
            </div>
            {canEditOrDelete(comment.author) && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingComment(comment._id);
                    setEditContent(comment.content);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this comment? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteComment(comment._id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {editingComment === comment._id ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleUpdateComment(comment._id)} disabled={loading}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingComment(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => handleReplyClick(comment._id)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Form */}
      {replyingTo === comment._id && (
        <div className="ml-8 mt-2">
          <Card className="bg-blue-50">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <Textarea
                  ref={(el) => { replyRefs.current[comment._id] = el; }}
                  placeholder="Write a reply..."
                  defaultValue={replyContents[comment._id] || ''}
                  className="min-h-[80px]"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => handleCreateReply(comment._id)} disabled={loading}>
                    <Send className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleCancelReply(comment._id)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem key={reply._id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
      </div>

      {/* New Comment Form */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <Textarea
              placeholder={isTeacher ? "Share your thoughts with students..." : "Ask a question or share your thoughts..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button onClick={handleCreateComment} disabled={loading || !newComment.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
