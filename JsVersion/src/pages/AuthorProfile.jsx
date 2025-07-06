// import { useState, useEffect } from "react";
// import { useParams } from "react-router";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { supabase } from "@/supabase/supabase";
// import Navbar from "@/layout/Navbar";
// import { Calendar, Eye, MessageSquare, ExternalLink } from "lucide-react";

// const AuthorProfile = () => {
//   const { id } = useParams();
//   const [profile, setProfile] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // useEffect(() => {
//   //   loadAuthorProfile();
//   // }, [id]);

//   // const loadAuthorProfile = async () => {
//   //   if (!id) return;

//   //   try {
//   //     const { data: profileData, error: profileError } = await supabase
//   //       .from("profiles")
//   //       .select("*")
//   //       .eq("username", username)
//   //       .single();

//   //     if (profileError) throw profileError;

//   //     setProfile({
//   //       id: profileData.id,
//   //       display_name: profileData.display_name ?? "",
//   //       bio: profileData.bio ?? "",
//   //       photo_url: profileData.photo_url ?? "",
//   //       role: profileData.role ?? "",
//   //       social_links: profileData.social_links,
//   //       created_at: profileData.created_at,
//   //     });

//   //     // Load posts by this author
//   //     const { data: postsData, error: postsError } = await supabase
//   //       .from("posts")
//   //       .select(
//   //         "id, title, excerpt, category, tags, published_at, likes_count, comments_count"
//   //       )
//   //       .eq("user_id", profileData.id)
//   //       .eq("status", "published")
//   //       .order("published_at", { ascending: false });

//   //     if (postsError) throw postsError;

//   //     setPosts(
//   //       (postsData || []).map((post) => ({
//   //         id: post.id,
//   //         title: post.title,
//   //         excerpt: post.excerpt ?? "",
//   //         category: post.category ?? "",
//   //         tags: post.tags ?? [],
//   //         published_at: post.published_at ?? "",
//   //         likes_count: post.likes_count ?? 0,
//   //         comments_count: post.comments_count ?? 0,
//   //       }))
//   //     );
//   //   } catch (error) {
//   //     console.error("Error loading author profile:", error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   // Helper function to safely parse social links
//   const getSocialLinks = (socialLinks) => {
//     if (
//       socialLinks &&
//       typeof socialLinks === "object" &&
//       !Array.isArray(socialLinks)
//     ) {
//       const links = {};
//       Object.entries(socialLinks).forEach(([key, value]) => {
//         if (typeof value === "string") {
//           links[key] = value;
//         }
//       });
//       return links;
//     }
//     return {};
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Navbar />
//         <div className="container mx-auto px-4 py-8">
//           <div className="text-center py-8">
//             <p className="text-muted-foreground">Loading author profile...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!profile) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Navbar />
//         <div className="container mx-auto px-4 py-8">
//           <div className="text-center py-8">
//             <p className="text-muted-foreground">Author not found.</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const socialLinks = getSocialLinks(profile.social_links);

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />

//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           {/* Author Header */}
//           <Card className="mb-8">
//             <CardContent className="pt-6">
//               <div className="flex items-start gap-6">
//                 <Avatar className="w-24 h-24">
//                   <AvatarImage src={profile.photo_url} />
//                   <AvatarFallback className="text-2xl">
//                     {profile.display_name?.[0]?.toUpperCase()}
//                   </AvatarFallback>
//                 </Avatar>

//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-2">
//                     <h1 className="text-3xl font-bold">
//                       {profile.display_name}
//                     </h1>
//                     <Badge variant="outline">{profile.role}</Badge>
//                   </div>

//                   {profile.bio && (
//                     <p className="text-muted-foreground mb-4">{profile.bio}</p>
//                   )}

//                   <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                     <div className="flex items-center gap-1">
//                       <Calendar className="w-4 h-4" />
//                       Joined {formatDate(profile.created_at)}
//                     </div>
//                     <div>{posts.length} posts published</div>
//                   </div>

//                   {Object.keys(socialLinks).length > 0 && (
//                     <div className="flex gap-2 mt-4">
//                       {Object.entries(socialLinks).map(([platform, url]) => (
//                         <a
//                           key={platform}
//                           href={url}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="flex items-center gap-1 text-sm text-primary hover:underline"
//                         >
//                           <ExternalLink className="w-3 h-3" />
//                           {platform}
//                         </a>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Author's Posts */}
//           <div>
//             <h2 className="text-2xl font-semibold mb-6">Published Posts</h2>

//             {posts.length === 0 ? (
//               <Card>
//                 <CardContent className="pt-6">
//                   <p className="text-center text-muted-foreground">
//                     This author hasn't published any posts yet.
//                   </p>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="grid gap-6">
//                 {posts.map((post) => (
//                   <Card key={post.id}>
//                     <CardHeader>
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <CardTitle className="mb-2">{post.title}</CardTitle>
//                           <CardDescription>
//                             {post.excerpt || "No excerpt available"}
//                           </CardDescription>
//                         </div>
//                         {post.category && (
//                           <Badge variant="secondary">{post.category}</Badge>
//                         )}
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                           <div className="flex items-center gap-1">
//                             <Calendar className="w-4 h-4" />
//                             {formatDate(post.published_at)}
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <Eye className="w-4 h-4" />
//                             {post.likes_count} likes
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <MessageSquare className="w-4 h-4" />
//                             {post.comments_count} comments
//                           </div>
//                         </div>

//                         {post.tags && post.tags.length > 0 && (
//                           <div className="flex gap-1">
//                             {post.tags.slice(0, 3).map((tag) => (
//                               <Badge
//                                 key={tag}
//                                 variant="outline"
//                                 className="text-xs"
//                               >
//                                 {tag}
//                               </Badge>
//                             ))}
//                             {post.tags.length > 3 && (
//                               <Badge variant="outline" className="text-xs">
//                                 +{post.tags.length - 3}
//                               </Badge>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthorProfile;

import { useEffect, useState } from "react";
import { supabase } from "@/supabase/supabase";
import { useAuth } from "@/store/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const AuthorProfile = () => {
  const { user } = useAuth();
  const { success, error: err } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    avatar_url: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);

  // Load profile data
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      console.log(user);
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, avatar_url, bio")
      .eq("id", user.id)
      .single();
    console.log("data: ", data);

    if (error) {
      console.error("Error fetching profile:", error.message);
    } else {
      setFormData({
        username: data.username || "",
        avatar_url: data.avatar_url || "",
        bio: data.bio || "",
      });
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...formData,
      updated_at: new Date().toISOString(),
    });

    setLoading(false);

    if (error) {
      console.error("Error updating profile:", error.message);
      err("Update failed");
    } else {
      success("Profile updated successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <Navbar /> */}
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>{user.email} Profile</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={formData.avatar_url} />
                  <AvatarFallback>
                    {formData.display_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Username</Label>
                <Input
                  name="username"
                  id="display_name"
                  placeholder="e.g., Rat Dev"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  name="avatar_url"
                  id="avatar_url"
                  placeholder="https://your-image-link.com"
                  value={formData.avatar_url}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 mb-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  name="bio"
                  id="bio"
                  placeholder="Tell us something about you..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AuthorProfile;
