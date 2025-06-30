
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Heart, Flag, Reply } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  user_id: string;
  parent_comment_id: string | null;
  likes_count: number;
  created_at: string;
  replies?: Comment[];
}

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into nested structure
      const commentsMap = new Map();
      const rootComments: Comment[] = [];

      data?.forEach(comment => {
        commentsMap.set(comment.id, { ...comment, replies: [] });
      });

      data?.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentsMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies.push(commentsMap.get(comment.id));
          }
        } else {
          rootComments.push(commentsMap.get(comment.id));
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const submitComment = async (content: string, parentId: string | null = null) => {
    if (!user || !content.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          parent_comment_id: parentId,
          content: content.trim(),
          author_name: user.email || 'Anonymous'
        }]);

      if (error) throw error;

      toast({
        title: 'Comment posted!',
        description: 'Your comment has been added.',
      });

      setNewComment('');
      setReplyContent('');
      setReplyingTo(null);
      loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to post comment.',
      });
    } finally {
      setLoading(false);
    }
  };

  const CommentItem: React.FC<{ comment: Comment; level: number }> = ({ comment, level }) => (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{comment.author_name[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{comment.author_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">{comment.content}</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="w-3 h-3 mr-1" />
              {comment.likes_count}
            </Button>
            {user && level < 2 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              >
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Flag className="w-3 h-3" />
            </Button>
          </div>
          
          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => submitComment(replyContent, comment.id)}
                  disabled={loading || !replyContent.trim()}
                >
                  Reply
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} level={level + 1} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>
      </div>

      {user ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[100px]"
              />
              <Button 
                onClick={() => submitComment(newComment)}
                disabled={loading || !newComment.trim()}
              >
                {loading ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Please sign in to post a comment.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} level={0} />
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;
