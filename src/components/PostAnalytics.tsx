
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, Heart, MessageSquare, TrendingUp, Calendar } from 'lucide-react';

interface PostAnalyticsProps {
  postId?: string;
  showUserStats?: boolean;
}

interface PostStats {
  views: number;
  likes: number;
  comments: number;
  title: string;
  published_at: string;
}

const PostAnalytics: React.FC<PostAnalyticsProps> = ({ 
  postId, 
  showUserStats = false 
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PostStats[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showUserStats && user) {
      loadUserStats();
    } else if (postId) {
      loadPostStats();
    }
  }, [postId, user, showUserStats]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, published_at, likes_count, comments_count')
        .eq('user_id', user.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      // Mock view data (in production, you'd track this properly)
      const postsWithViews = posts?.map(post => ({
        ...post,
        views: Math.floor(Math.random() * 1000) + 50, // Mock data
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
      })) || [];

      setStats(postsWithViews);

      const totals = postsWithViews.reduce(
        (acc, post) => ({
          totalPosts: acc.totalPosts + 1,
          totalViews: acc.totalViews + post.views,
          totalLikes: acc.totalLikes + post.likes,
          totalComments: acc.totalComments + post.comments,
        }),
        { totalPosts: 0, totalViews: 0, totalLikes: 0, totalComments: 0 }
      );

      setTotalStats(totals);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPostStats = async () => {
    if (!postId) return;

    try {
      const { data: post, error } = await supabase
        .from('posts')
        .select('title, published_at, likes_count, comments_count')
        .eq('id', postId)
        .single();

      if (error) throw error;

      const postWithViews = {
        ...post,
        views: Math.floor(Math.random() * 1000) + 50, // Mock data
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
      };

      setStats([postWithViews]);
    } catch (error) {
      console.error('Error loading post stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (showUserStats) {
    return (
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold">{totalStats.totalPosts}</p>
                </div>
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{totalStats.totalViews}</p>
                </div>
                <Eye className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Likes</p>
                  <p className="text-2xl font-bold">{totalStats.totalLikes}</p>
                </div>
                <Heart className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Comments</p>
                  <p className="text-2xl font-bold">{totalStats.totalComments}</p>
                </div>
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Post Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Post Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.slice(0, 5).map((post, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{post.title}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {post.comments}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length > 0 && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{stats[0].views} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{stats[0].likes} likes</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{stats[0].comments} comments</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostAnalytics;
