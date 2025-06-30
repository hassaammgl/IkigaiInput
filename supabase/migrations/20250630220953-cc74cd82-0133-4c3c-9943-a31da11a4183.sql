
-- Update posts table to include new metadata fields
ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS read_time INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create comment reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(comment_id, user_id, emoji)
);

-- Update profiles table to include new fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'reader';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Enable RLS on new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (public read, authenticated write)
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON categories FOR UPDATE TO authenticated USING (true);

-- Create policies for tags (public read, authenticated write)
CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tags" ON tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tags" ON tags FOR UPDATE TO authenticated USING (true);

-- Create policies for comments
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create policies for comment reactions
CREATE POLICY "Comment reactions are viewable by everyone" ON comment_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage their own reactions" ON comment_reactions FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create function to update comment counts
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment count updates
DROP TRIGGER IF EXISTS update_comment_count_trigger ON comments;
CREATE TRIGGER update_comment_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Insert some default categories
INSERT INTO categories (name, description) VALUES 
  ('Technology', 'Posts about technology and programming'),
  ('Lifestyle', 'Posts about lifestyle and personal experiences'),
  ('Business', 'Posts about business and entrepreneurship'),
  ('Health', 'Posts about health and wellness'),
  ('Travel', 'Posts about travel and adventures')
ON CONFLICT (name) DO NOTHING;

-- Insert some default tags
INSERT INTO tags (name, description) VALUES 
  ('React', 'Posts about React framework'),
  ('JavaScript', 'Posts about JavaScript programming'),
  ('Tutorial', 'Tutorial and how-to posts'),
  ('Opinion', 'Opinion and editorial posts'),
  ('News', 'News and current events')
ON CONFLICT (name) DO NOTHING;
