import { supabase } from "@/supabase/supabase";

export async function linkPostTags(postId, tagNames = []) {
  if (!tagNames.length) return;

  // Fetch matching tag ids
  const { data: tagData, error: tagError } = await supabase
    .from("tags")
    .select("id, name")
    .in("name", tagNames);

  if (tagError) throw tagError;

  const tagLinks = tagData.map(tag => ({
    post_id: postId,
    tag_id: tag.id,
  }));

  const { error: linkError } = await supabase
    .from("post_tags")
    .insert(tagLinks);

  if (linkError) throw linkError;
}
