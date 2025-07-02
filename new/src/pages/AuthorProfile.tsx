
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Calendar, Eye, MessageSquare, ExternalLink } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface AuthorProfile {
  id: string;
  display_name: string;
  bio: string;
  photo_url: string;
  role: string;
  social_links: Json;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  published_at: string;
  likes_count: number;
  comments_count: number;
}

const AuthorProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthorProfile();
  }, [username]);

  const loadAuthorProfile = async () => {
    if (!username) return;

    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);

      // Load posts by this author
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, title, excerpt, category, tags, published_at, likes_count, comments_count')
        .eq('user_id', profileData.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (postsError) throw postsError;

      setPosts(postsData || []);
    } catch (error) {
      console.error('Error loading author profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper function to safely parse social links
  const getSocialLinks = (socialLinks: Json): Record<string, string> => {
    if (socialLinks && typeof socialLinks === 'object' && !Array.isArray(socialLinks)) {
      const links: Record<string, string> = {};
      Object.entries(socialLinks).forEach(([key, value]) => {
        if (typeof value === 'string') {
          links[key] = value;
        }
      });
      return links;
    }
    return {};
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading author profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Author not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const socialLinks = getSocialLinks(profile.social_links);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Author Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.photo_url} />
                  <AvatarFallback className="text-2xl">
                    {profile.display_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                    <Badge variant="outline">{profile.role}</Badge>
                  </div>
                  
                  {profile.bio && (
                    <p className="text-muted-foreground mb-4">{profile.bio}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(profile.created_at)}
                    </div>
                    <div>{posts.length} posts published</div>
                  </div>
                  
                  {Object.keys(socialLinks).length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {Object.entries(socialLinks).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {platform}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author's Posts */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Published Posts</h2>
            
            {posts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    This author hasn't published any posts yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="mb-2">{post.title}</CardTitle>
                          <CardDescription>
                            {post.excerpt || 'No excerpt available'}
                          </CardDescription>
                        </div>
                        {post.category && (
                          <Badge variant="secondary">{post.category}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.published_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.likes_count} likes
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {post.comments_count} comments
                          </div>
                        </div>
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-1">
                            {post.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
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

export default AuthorProfile;
