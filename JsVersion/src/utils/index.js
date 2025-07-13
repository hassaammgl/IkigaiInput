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