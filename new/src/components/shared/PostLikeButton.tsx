
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { supabase } from '@/supabase/supabase';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface PostLikeButtonProps {
  postId: string;
  initialLikesCount: number;
  onLikeChange?: (newCount: number) => void;
}

const PostLikeButton: React.FC<PostLikeButtonProps> = ({ 
  postId, 
  initialLikesCount,
  onLikeChange 
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [user, postId]);

  const checkIfLiked = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (!error) {
        setIsLiked(true);
      }
    } catch (error) {
      // User hasn't liked the post
      setIsLiked(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsLiked(false);
        const newCount = likesCount - 1;
        setLikesCount(newCount);
        onLikeChange?.(newCount);
        toast.success('Post unliked');
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;

        setIsLiked(true);
        const newCount = likesCount + 1;
        setLikesCount(newCount);
        onLikeChange?.(newCount);
        toast.success('Post liked!');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleLike}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
    </Button>
  );
};

export default PostLikeButton;
