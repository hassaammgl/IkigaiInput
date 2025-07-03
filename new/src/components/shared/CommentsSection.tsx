
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { supabase } from '@/supabase/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NestedComments from '@/components/shared/NestedComments';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  user_id: string;
  created_at: string;
  likes_count: number;
  parent_comment_id: string | null;
  replies?: Comment[];
}

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into nested structure
      const commentMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];

      // First pass: create comment objects
      data?.forEach(comment => {
        commentMap.set(comment.id, { 
          ...comment, 
          created_at: comment.created_at ?? '', // fallback to empty string if null
          likes_count: comment.likes_count ?? 0, // fallback to 0 if null
          replies: [] 
        });
      });

      // Second pass: organize into hierarchy
      data?.forEach(comment => {
        const commentObj = commentMap.get(comment.id)!;
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies!.push(commentObj);
          }
        } else {
          topLevelComments.push(commentObj);
        }
      });

      setComments(topLevelComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          author_name: user.email || 'Anonymous',
          content: newComment.trim(),
          parent_comment_id: null,
        });

      if (error) throw error;

      setNewComment('');
      loadComments();
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Comment Form */}
        <div className="mb-6">
          <Textarea
            placeholder={user ? "Share your thoughts..." : "Please sign in to comment"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!user}
            rows={4}
            className="mb-3"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={loading || !user || !newComment.trim()}
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>

        {/* Comments List */}
        {commentsLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <NestedComments
            comments={comments}
            postId={postId}
            onCommentAdded={loadComments}
            onCommentDeleted={loadComments}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CommentsSection;
