
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { PenTool, Calendar, Edit } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  status: string;
  created_at: string;
  published_at: string | null;
}

const Index = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
    if (user) {
      loadUserPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, excerpt, status, created_at, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, excerpt, status, created_at, published_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPosts(data || []);
    } catch (error) {
      console.error('Error loading user posts:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Welcome to Shibui Notes</h1>
            <p className="text-xl text-muted-foreground mb-8">
              A beautiful place to write and share your thoughts
            </p>
            {user ? (
              <Button asChild size="lg">
                <Link to="/editor">
                  <PenTool className="w-5 h-5 mr-2" />
                  Start Writing
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link to="/auth">Get Started</Link>
              </Button>
            )}
          </div>

          {/* User Posts Section */}
          {user && userPosts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Your Posts</h2>
              <div className="grid gap-6">
                {userPosts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="mb-2">{post.title}</CardTitle>
                          <CardDescription>
                            {post.excerpt || 'No excerpt available'}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status}
                          </Badge>
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/editor/${post.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {post.status === 'published' && post.published_at
                          ? `Published ${formatDate(post.published_at)}`
                          : `Created ${formatDate(post.created_at)}`}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Published Posts Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Latest Posts</h2>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No posts yet. Be the first to write one!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <CardTitle>{post.title}</CardTitle>
                      <CardDescription>
                        {post.excerpt || 'No excerpt available'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        Published {formatDate(post.published_at || post.created_at)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
