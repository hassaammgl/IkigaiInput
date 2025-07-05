import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/supabase/supabase";
import { X, Plus } from "lucide-react";

const CategoryTagSelector = ({
  selectedCategory,
  selectedTags = [],
  onCategoryChange,
  onTagsChange,
}) => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    loadCategoriesAndTags();
  }, []);

  const safeSelectedTags = Array.isArray(selectedTags) ? selectedTags : [];
  const safeTags = Array.isArray(tags) ? tags : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

 const addTag = (tagName) => {
  if (tagName && !safeSelectedTags.includes(tagName)) {
    onTagsChange([...safeSelectedTags, tagName]);
  }
};


  const loadCategoriesAndTags = async () => {
    try {
      const [categoriesResult, tagsResult] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        supabase.from("tags").select("*").order("name"),
      ]);

      if (categoriesResult.data)
        setCategories(
          categoriesResult.data.map((category) => ({
            id: category.id,
            name: category.name,
            description: category.description ?? "",
          }))
        );
      if (tagsResult.data)
        setTags(
          tagsResult.data.map((tag) => ({
            id: tag.id,
            name: tag.name,
            description: tag.description ?? "",
          }))
        );
    } catch (error) {
      console.error("Error loading categories and tags:", error);
    }
  };

  const removeTag = (tagName) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagName));
  };

  const createNewTag = async () => {
    if (!newTag.trim()) return;

    const tagName = newTag.trim();
    const slug = tagName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    try {
      const { data, error } = await supabase
        .from("tags")
        .upsert([{ name: tagName, slug }], {
          onConflict: "slug",
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase Insert Error:", error.message);
        return;
      }

      const newTagObj = {
        id: data.id,
        name: data.name,
        description: data.description ?? "",
      };

      setTags((prev) => [...prev, newTagObj]);
      addTag(newTagObj.name);
      setNewTag("");
    } catch (err) {
      console.error("Error creating tag:", err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          name="category"
          value={selectedCategory}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {safeCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {safeSelectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 mb-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add new tag..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // 🧽 prevent form submit
                createNewTag();
              }
            }}
          />
          <Button type="button" onClick={createNewTag} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {safeTags
            .filter((tag) => !safeSelectedTags.includes(tag?.name))
            .map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                onClick={() => addTag(tag.name)}
              >
                {tag.name}
              </Badge>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTagSelector;
