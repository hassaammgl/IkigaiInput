
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/supabase/supabase';
import { X, Plus } from 'lucide-react';



const CategoryTagSelector = ({
  selectedCategory,
  selectedTags,
  onCategoryChange,
  onTagsChange
}) => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadCategoriesAndTags();
  }, []);

  const loadCategoriesAndTags = async () => {
    try {
      const [categoriesResult, tagsResult] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('tags').select('*').order('name')
      ]);

      if (categoriesResult.data) setCategories(
        categoriesResult.data.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description ?? ''
        }))
      );
      if (tagsResult.data) setTags(
        tagsResult.data.map(tag => ({
          id: tag.id,
          name: tag.name,
          description: tag.description ?? ''
        }))
      );
    } catch (error) {
      console.error('Error loading categories and tags:', error);
    }
  };

  const addTag = (tagName) => {
    if (tagName && !selectedTags.includes(tagName)) {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const removeTag = (tagName) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagName));
  };

  const createNewTag = async () => {
    if (!newTag.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([{ name: newTag.trim() }])
        .select()
        .single();

      if (error) throw error;

      const newTagObj = {
        id: data.id,
        name: data.name,
        description: data.description ?? ''
      };
      setTags([...tags, newTagObj]);
      addTag(newTagObj.name);
      setNewTag('');
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
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
            onKeyPress={(e) => e.key === 'Enter' && createNewTag()}
          />
          <Button type="button" onClick={createNewTag} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {tags
            .filter(tag => !selectedTags.includes(tag.name))
            .map(tag => (
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
