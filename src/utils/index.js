import { supabase } from "@/supabase/supabase";


export async function linkPostTags(postId, tagNames = []) {
  if (!tagNames.length) return;

  const { data: tagData, error: tagError } = await supabase
    .from("tags")
    .select("id, name")
    .in("name", tagNames);

  if (tagError) throw tagError;

  const tagLinks = tagData.map((tag) => ({
    post_id: postId,
    tag_id: tag.id,
  }));

  const { error: insertError } = await supabase
    .from("post_tags")
    .insert(tagLinks);

  if (insertError) throw insertError;
}

export async function getTags(tagsId = []) {
  if (!tagsId?.length) return [];

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .in("id", tagsId);
  console.log(data);

  if (error) {
    console.error("Error fetching tags:", error);
    return [];
  }

  return data.map(t => t.name);
}


export async function getCategory(catId) {
  if (!catId) return null;

  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .eq("id", catId)
    .single();

  if (error) {
    console.error("Error fetching category:", error);
    return null;
  }

  return data?.name || null;
}

export async function getUsername(id) {
  if (!id) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching username:", error);
    return null;
  }

  return data.username;
}

export async function getLikes(postId) {
  if (!postId) return 0;

  const { count, error } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true }) // we just want the count
    .eq("post_id", postId);

  if (error) {
    console.error("Error fetching likes:", error);
    return 0;
  }

  return count || 0;
}

export async function getViews(postId) {
  if (!postId) return 0;

  const { count, error } = await supabase
    .from("views")
    .select("*", { count: "exact", head: true }) // count only, no data
    .eq("post_id", postId);

  if (error) {
    console.error("Error fetching views:", error);
    return 0;
  }

  return count || 0;
}


export async function updateViews(postId, viewerId) {
  if (!postId) return;

  try {
    const { data: existingView, error: checkError } = await supabase
      .from("views")
      .select("id")
      .eq("post_id", postId)
      .eq("viewer_id", viewerId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingView) return;

    const { error: insertError } = await supabase.from("views").insert([
      {
        post_id: postId,
        viewer_id: viewerId ?? null,
        user_agent: navigator.userAgent,
      },
    ]);

    if (insertError) throw insertError;
  } catch (error) {
    console.error("Error updating views:", error);
  }
}

export async function getPostBySlug(slug) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .eq("visibility", "public")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getAuthorProfile(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching author profile:", error);
    return null;
  }

  return data;
}


export async function updateLikes(postId, userId) {
  if (!postId || !userId) return;

  try {
    const { data: existingLike, error: checkError } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id);

      if (deleteError) throw deleteError;

      return { liked: false };
    } else {
      const { error: insertError } = await supabase
        .from("likes")
        .insert([{ post_id: postId, user_id: userId }]);

      if (insertError) throw insertError;

      return { liked: true };
    }
  } catch (error) {
    console.error("Error updating like:", error.message);
    return null;
  }
}


export async function getTagsByPostId(post_id) {
  if (!post_id) return [];

  const { data, error } = await supabase
    .from("post_tags")
    .select("tag_id, tags(name)") // Join with tags table to get tag names
    .eq("post_id", post_id);

  if (error) {
    console.error("Error fetching tags for post:", error);
    return [];
  }

  // Extract tag names from the joined data
  return data.map((item) => item.tags?.name).filter(Boolean);
}
