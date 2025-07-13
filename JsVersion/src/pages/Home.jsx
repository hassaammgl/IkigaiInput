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
import TrendingPosts from "@/components/shared/TrendingPosts";
import {
  PenTool,
  Calendar,
  Edit,
  Eye,
  MessageSquare,
  Clock10Icon,
} from "lucide-react";
import { getCategory, getTags, getUsername } from "@/utils";

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
        .order("created_at", { ascending: false })
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
        .eq("author_id", user?.id)
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
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  post.visibility === "public"
                                    ? "secondary"
                                    : post.visibility === "private"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {post.visibility === "private"
                                  ? "Private"
                                  : "Public"}
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
                      <CARD key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <TrendingPosts timeRange="week" limit={5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const CARD = ({ post }) => {
  const [postCategoryName, setPostCategoryName] = useState("");
  const [postTags, setPostTags] = useState([]);
  const [authorUsername, setAuthorUsername] = useState("");

  const { user } = useAuth();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const [{ data: tagLinks }, categoryName, username] = await Promise.all([
          supabase.from("post_tags").select("tag_id").eq("post_id", post.id),
          getCategory(post.category_id),
          getUsername(post.author_id),
        ]);

        if (tagLinks) {
          const tags = await getTags(tagLinks.map((t) => t.tag_id));
          setPostTags(tags);
        }
        setPostCategoryName(categoryName);
        setAuthorUsername(username);
      } catch (err) {
        console.error("Error loading post tags/category:", err);
      }
    };

    getData();
  }, []);

  console.log(user);

  return (
    <Card className="flex flex-col md:flex-row overflow-hidden shadow-sm border rounded-2xl">
      {/* Cover Image */}
      <Link to={`/post/${post.slug}`}>
        {post?.cover_image_url && (
          <div className="w-full ml-4 md:w-48 h-40 md:h-auto shrink-0 overflow-hidden">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="object-cover size-40"
            />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col justify-between p-4 flex-1">
        <div>
          <Link to={`/post/${post.slug}`}>
            <CardTitle className="text-xl mb-1">{post.title}</CardTitle>
          </Link>
          <CardDescription>
            {post.author_id && (
              <p className="text-muted-foreground text-sm mb-2">
                by {"@" + authorUsername}
              </p>
            )}
          </CardDescription>

          {/* Tags and Category */}
          <div className="flex flex-wrap gap-2 mb-3">
            {post?.category_id && (
              <Badge variant="outline" className="text-xs">
                {postCategoryName}
              </Badge>
            )}
            {postTags.length >= 3
              ? [...postTags]?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))
              : [...postTags].map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
            <span className="text-sm">
              {postTags.length > 3 ? `+ ${postTags.length - 3}` : null}
            </span>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(post.created_at)}
            </div>
            <div className="flex items-center gap-2">
              <Clock10Icon className="w-4 h-4" />
              {calculateReadTime(post.content)}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post?.likes_count}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {post?.comments_count}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Home;
