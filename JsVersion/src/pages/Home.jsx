import { useEffect, useState } from "react";
import { NavLink as Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/store/auth";
import { supabase } from "@/supabase/supabase";
import Navbar from "@/layout/Navbar";
// import TrendingPosts from "@/components/TrendingPosts";
import { PenTool, Calendar, Edit, Eye, MessageSquare } from "lucide-react";

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
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
        .from("posts")
        .select("*")
        .eq("published", true) // ✅ FIXED
        .eq("visibility", "public")
        .order("published_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      setPosts(
        (data || []).map((post) => ({
          ...post,
          likes_count: post.likes_count ?? 0,
          comments_count: post.comments_count ?? 0,
        }))
      );
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", user.id) // ✅ FIXED
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setUserPosts(
        (data || []).map((post) => ({
          ...post,
          likes_count: post.likes_count ?? 0,
          comments_count: post.comments_count ?? 0,
        }))
      );
    } catch (error) {
      console.error("Error loading user posts:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* User Posts Section */}
              {user && userPosts.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">
                    Your Recent Posts
                  </h2>
                  <div className="grid gap-6">
                    {userPosts.map((post) => (
                      <Card key={post.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="mb-2">
                                {post.title}
                              </CardTitle>
                              <CardDescription>
                                {post.excerpt || "No excerpt available"}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  post.status === "published"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {post.status}
                              </Badge>
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/editor/${post.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                          {(post.category ||
                            (post.tags && post.tags.length > 0)) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {post.category && (
                                <Badge variant="outline">{post.category}</Badge>
                              )}
                              {post.tags?.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            {post.status === "published" && post.published_at
                              ? `Published ${formatDate(post.published_at)}`
                              : `Created ${formatDate(post.created_at)}`}
                            {post.read_time && (
                              <>
                                <span className="mx-2">•</span>
                                {post.read_time} min read
                              </>
                            )}
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
                    <p className="text-muted-foreground">
                      No posts yet. Be the first to write one!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {posts.map((post) => (
                      <Card key={post.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle>{post.title}</CardTitle>
                              <CardDescription>
                                {post.excerpt || "No excerpt available"}
                              </CardDescription>
                              {post.author_name && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  by {post.author_name}
                                </p>
                              )}
                            </div>
                            {post.category && (
                              <Badge variant="outline">{post.category}</Badge>
                            )}
                          </div>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags.slice(0, 4).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {post.tags.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{post.tags.length - 4}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(
                                  post.published_at || post.created_at
                                )}
                              </div>
                              {post.read_time && (
                                <span>{post.read_time} min read</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {post.likes_count}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {post.comments_count}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* <TrendingPosts timeRange="week" limit={5} /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
