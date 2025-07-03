
import React, { useState } from 'react';
import { useAuth } from '@/store/auth';
import { supabase } from '@/supabase/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Reply, Heart, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface NestedCommentsProps {
  comments: Comment[];
  postId: string;
  onCommentAdded: () => void;
  onCommentDeleted: () => void;
  level?: number;
}

const NestedComments: React.FC<NestedCommentsProps> = ({ 
  comments, 
  postId, 
  onCommentAdded, 
  onCommentDeleted,
  level = 0 
}) => {
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) {
      toast.error('Please sign in and enter a reply');
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
          content: replyContent.trim(),
          parent_comment_id: parentId,
        });

      if (error) throw error;

      setReplyContent('');
      setReplyingTo(null);
      onCommentAdded();
      toast.success('Reply added successfully!');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      onCommentDeleted();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  if (level > 3) {
    // Limit nesting depth to prevent infinite nesting
    return null;
  }

  return (
    <div className={`space-y-4 ${level > 0 ? 'ml-8 mt-4' : ''}`}>
      {comments.map((comment) => (
        <div key={comment.id}>
          <Card className={`${level > 0 ? 'border-l-4 border-l-primary/20' : ''}`}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {comment.author_name[0]?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.author_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    
                    {user?.id === comment.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-destructive"
                          >
                            Delete Comment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
                  <p className="text-sm mb-3">{comment.content}</p>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="h-auto p-0 text-xs"
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="w-3 h-3" />
                      {comment.likes_count || 0}
                    </div>
                  </div>
                </div>
              </div>
              
              {replyingTo === comment.id && (
                <div className="mt-4 ml-11">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="mb-2"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReply(comment.id)}
                      disabled={loading || !replyContent.trim()}
                    >
                      Post Reply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {comment.replies && comment.replies.length > 0 && (
            <NestedComments
              comments={comment.replies}
              postId={postId}
              onCommentAdded={onCommentAdded}
              onCommentDeleted={onCommentDeleted}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default NestedComments;
