
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '@/store/auth';
import { supabase } from '@/supabase/supabase';
import Navbar from '@/layout/Navbar';
import PostLikeButton from '@/components/shared/PostLikeButton';
import ShareButtons from '@/components/shared/ShareButtons';
import CommentsSection from '@/components/shared/CommentsSection';
import RelatedPosts from '@/components/shared/RelatedPosts';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Eye, MessageSquare } from 'lucide-react';


const BlogPost = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewsCount, setViewsCount] = useState(0);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  useEffect(() => {
    if (post) {
      recordView();
      loadViewsCount();
    }
  }, [post]);

  const loadPost = async () => {
    try {
      const { data: postData, error: postError } = await supabase
  .from('posts')
  .select('*')
  .eq('slug', slug)
  .eq('published', true)
  .eq('visibility', 'public')
  .single();


      if (postError) {
        if (postError.code === 'PGRST116') {
          navigate('/404');
          return;
        }
        throw postError;
      }

      setPost({
        ...postData,
        title: postData.title ?? '',
        content: postData.content ?? '',
        excerpt: postData.excerpt ?? '',
        author_name: postData.author_name ?? '',
        category: postData.category ?? '',
        tags: postData.tags ?? [],
        published_at: postData.published_at ?? '',
        read_time: postData.read_time ?? 0,
        likes_count: postData.likes_count ?? 0,
        comments_count: postData.comments_count ?? 0,
        cover_image_url: postData.cover_image_url ?? '',
        user_id: postData.user_id ?? '',
        id: postData.id ?? '',
      });

      // Load author profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, bio')
        .eq('id', postData.user_id)
        .single();

      if (!profileError) {
        setAuthor({
          id: profileData.id,
          display_name: profileData.display_name ?? '',
          avatar_url: profileData.avatar_url ?? '',
          bio: profileData.bio ?? '',
        });
      }
    } catch (error) {
      console.error('Error loading post:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const recordView = async () => {
    if (!post) return;

    try {
      await supabase
        .from('post_views')
        .insert({
          post_id: post.id,
          user_id: user?.id || null,
          ip_address: null, // You could implement IP tracking if needed
          user_agent: navigator.userAgent,
        });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const loadViewsCount = async () => {
    if (!post) return;

    try {
      const { count, error } = await supabase
        .from('post_views')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);

      if (!error) {
        setViewsCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading views count:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatContent = (content) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
              <div className="h-64 bg-muted rounded mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <article className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="mb-4">
              {post.category && (
                <Badge variant="secondary" className="mb-4">
                  {post.category}
                </Badge>
              )}
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              {/* <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p> */}
            </div>

            {/* Author and Meta Info */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={author?.avatar_url || ''} />
                  <AvatarFallback>
                    {author?.display_name?.[0] || post.author_name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {author?.display_name || post.author_name}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.created_at)}
                      {/* {(post.created_at)} */}
                    </div>
                    {/* {post.read_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.read_time} min read
                      </div>
                    )} */}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {viewsCount}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {post.comments_count}
                </div>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Cover Image */}
            {post.cover_image_url && (
              <div className="mb-8">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </header>

          {/* Like and Share Buttons */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b">
            <PostLikeButton 
              postId={post.id} 
              initialLikesCount={post.likes_count}
              onLikeChange={(newCount) => setPost(prev => prev ? {...prev, likes_count: newCount} : null)}
            />
            <ShareButtons 
              title={post.title}
              excerpt={post.excerpt}
              url={window.location.href}
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12">
            {/* {formatContent(post.content || '')} */}
            {<div dangerouslySetInnerHTML={{__html: post.content}} />}
          </div>

          {/* Author Bio */}
          {author?.bio && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={author.avatar_url || ''} />
                    <AvatarFallback>
                      {author.display_name?.[0] || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">About {author.display_name}</h3>
                    <p className="text-muted-foreground">{author.bio}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Comments Section */}
          <div className="mb-12">
            <CommentsSection postId={post.id} />
          </div>

          {/* Related Posts */}
          <RelatedPosts 
            currentPostId={post.id}
            category={post.category}
            tags={post.tags}
          />
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
