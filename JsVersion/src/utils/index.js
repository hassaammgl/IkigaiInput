import { supabase } from "@/supabase/supabase";

// 🔁 Insert tag connections for a post
export async function linkTagsToPost(postId, tagNames = []) {
  if (!postId || tagNames.length === 0) return;

  try {
    // 1️⃣ Get tag rows matching the names
    const { data: tags, error: tagError } = await supabase
      .from("tags")
      .select("id, name")
      .in("name", tagNames);

    if (tagError) throw tagError;

    // 2️⃣ Prepare rows for post_tags table
    const tagLinks = tags.map((tag) => ({
      post_id: postId,
      tag_id: tag.id,
    }));

    // 3️⃣ Insert into post_tags
    const { error: insertError } = await supabase
      .from("post_tags")
      .insert(tagLinks);

    if (insertError) throw insertError;

    console.log("✅ Tags linked to post!");
    return true;
  } catch (error) {
    console.error("Error linking tags to post:", error);
    return false;
  }
}
