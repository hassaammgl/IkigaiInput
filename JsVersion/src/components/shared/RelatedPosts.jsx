
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/supabase/supabase';
import { Calendar, Eye, MessageSquare } from 'lucide-react';


const RelatedPosts= ({
  currentPostId,
  category,
  tags = [],
  limit = 3
}) => {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatedPosts();
  }, [currentPostId, category, tags]);

  const loadRelatedPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select('id, title, excerpt, category, tags, author_name, published_at, likes_count, comments_count')
        .eq('status', 'published')
        .neq('id', currentPostId)
        .order('published_at', { ascending: false });

      const { data: allPosts, error } = await query;

      if (error) throw error;

      // Score posts based on similarity
      const scoredPosts = allPosts?.map(post => {
        let score = 0;
        
        // Same category gets high score
        if (category && post.category === category) {
          score += 10;
        }
        
        // Shared tags get medium score
        if (tags.length > 0 && post.tags) {
          const sharedTags = tags.filter(tag => (post.tags ?? []).includes(tag));
          score += sharedTags.length * 5;
        }
        
        // Recent posts get small boost
        const daysSincePublished = Math.floor(
          (Date.now() - new Date(post.published_at ?? '').getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSincePublished < 30) {
          score += Math.max(0, 3 - daysSincePublished / 10);
        }

        return { ...post, similarity_score: score };
      }).sort((a, b) => b.similarity_score - a.similarity_score) || [];

      // Map to RelatedPost type, ensuring no nulls
      setRelatedPosts(
        scoredPosts.slice(0, limit).map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt ?? '',
          category: post.category ?? '',
          tags: post.tags ?? [],
          author_name: post.author_name ?? '',
          published_at: post.published_at ?? '',
          likes_count: post.likes_count ?? 0,
          comments_count: post.comments_count ?? 0,
        }))
      );
    } catch (error) {
      console.error('Error loading related posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Related Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Loading related posts...</p>
        </CardContent>
      </Card>
    );
  }

  if (relatedPosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Related Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No related posts found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatedPosts.map((post) => (
            <div key={post.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2 line-clamp-2">{post.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {post.excerpt || 'No excerpt available'}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-3">
                  <span>by {post.author_name}</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.published_at)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.likes_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {post.comments_count}
                  </div>
                </div>
              </div>

              {post.category && (
                <Badge variant="outline" className="text-xs">
                  {post.category}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedPosts;
