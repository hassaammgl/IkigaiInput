
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/supabase/supabase';
import { TrendingUp, Eye, Heart, MessageSquare, Calendar } from 'lucide-react';


const TrendingPosts = ({ 
  timeRange = 'week', 
  limit = 5 
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState(timeRange);

  useEffect(() => {
    loadTrendingPosts();
  }, [selectedRange, limit]);

  const loadTrendingPosts = async () => {
    setLoading(true);
    try {
      let dateFilter = new Date();
      
      switch (selectedRange) {
        case 'today':
          dateFilter.setDate(dateFilter.getDate() - 1);
          break;
        case 'week':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case 'month':
          dateFilter.setMonth(dateFilter.getMonth() - 1);
          break;
        case 'all':
          dateFilter = new Date('2020-01-01'); // Far back date
          break;
      }

      const { data, error } = await supabase
        .from('posts')
        .select('id, title, excerpt, category, tags, author_name, published_at, likes_count, comments_count')
        .eq('status', 'published')
        .gte('published_at', dateFilter.toISOString())
        .order('likes_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const trendingPosts = data?.map(post => ({
        ...post,
        excerpt: post.excerpt ?? '',
        category: post.category ?? '',
        tags: post.tags ?? [],
        author_name: post.author_name ?? '',
        published_at: post.published_at ?? '',
        likes_count: post.likes_count ?? 0,
        comments_count: post.comments_count ?? 0,
        trend_score: (post.likes_count ?? 0) * 2 + (post.comments_count ?? 0) * 3,
      })).sort((a, b) => b.trend_score - a.trend_score) || [];

      setPosts(trendingPosts);
    } catch (error) {
      console.error('Error loading trending posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center flex-col justify-between">
          <CardTitle className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            Trending Posts
          </CardTitle>
          <CardDescription >

          <div className="flex gap-1">
            {timeRangeOptions.map(option => (
              <Button
                key={option.value}
                variant={selectedRange === option.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedRange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading trending posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No trending posts found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div key={post.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium line-clamp-1">{post.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {post.excerpt || 'No excerpt available'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>by {post.author_name}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.published_at)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.likes_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {post.comments_count}
                      </div>
                    </div>
                  </div>
                  {post.category && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {post.category}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendingPosts;
