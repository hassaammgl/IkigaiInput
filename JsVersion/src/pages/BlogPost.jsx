import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/store/auth";
import { supabase } from "@/supabase/supabase";
import Navbar from "@/layout/Navbar";
import PostLikeButton from "@/components/shared/PostLikeButton";
import ShareButtons from "@/components/shared/ShareButtons";
import CommentsSection from "@/components/shared/CommentsSection";
import RelatedPosts from "@/components/shared/RelatedPosts";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Eye, MessageSquare } from "lucide-react";
import { getPostBySlug, getCategory, getUsername, updateViews } from "@/utils";
import MetaData from "@/components/shared/MetaData";

const BlogPost = () => {
  const { slug } = useParams();
  // const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewsCount, setViewsCount] = useState(0);
  const [postCategory, setPostCategory] = useState("");

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, []);

  // useEffect(async () => {
  //   await updateViews();
  // }, []);

  const loadPost = async () => {
    try {
      const [postData] = await Promise.all([getPostBySlug(slug)]);

      if (postData) {
        const category = await getCategory(postData.category_id);
        setPostCategory(category);
      }
      if (postData) {
        const author = await getUsername(postData.author_id);
        console.log(author);
        setAuthor(author);
      }

      setPost({
        id: postData.id,
        title: postData.title,
        content: postData.content,
        cover_image_url: postData.cover_image_url,
        author_id: postData.author_id,
        slug: postData.slug,
        published: postData.published,
        created_at: postData.created_at,
        updated_at: postData.updated_at,
        category_id: postData.category_id,
        visibility: postData.visibility,
      });
    } catch (error) {
      console.error("Error loading post:", error);
      navigate("/404");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
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
              {post?.category_id && (
                <Badge variant="secondary" className="mb-4">
                  {postCategory}
                </Badge>
              )}
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            </div>
            {/* Author and Meta Info */}
            <MetaData title={post.title} />
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={author?.avatar_url || ""} />
                  <AvatarFallback>
                    {author.substring(0, 2).toUpperCase() || "A"}
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
                    </div>
                    {post.content && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {calculateReadTime(post.content)} min read
                      </div>
                    )}
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
            {/* {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )} */}
            

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
              onLikeChange={(newCount) =>
                setPost((prev) =>
                  prev ? { ...prev, likes_count: newCount } : null
                )
              }
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
            {<div dangerouslySetInnerHTML={{ __html: post.content }} />}
          </div>

          {/* Author Bio */}
          {author?.bio && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={author.avatar_url || ""} />
                    <AvatarFallback>
                      {author.display_name?.[0] || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      About {author.display_name}
                    </h3>
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
          {/* <RelatedPosts
            currentPostId={post.id}
            category={post.category}
            tags={post.tags}
          /> */}
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
