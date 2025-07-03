
-- Initial setup: Create profiles table and basic blog structure
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  slug TEXT UNIQUE,
  featured_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Posts policies
CREATE POLICY "Anyone can view published posts" 
  ON public.posts 
  FOR SELECT 
  USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" 
  ON public.posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

-- Create storage policies for post images
CREATE POLICY "Anyone can view post images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own post images" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own post images" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Extended blog features: Add metadata fields to posts
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

-- Create post likes table
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create post views table
CREATE TABLE public.post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for post_likes
CREATE POLICY "Anyone can view post likes" 
  ON public.post_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can like posts" 
  ON public.post_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" 
  ON public.post_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS for post_views
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Create policies for post_views
CREATE POLICY "Anyone can view post views" 
  ON public.post_views 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can record post views" 
  ON public.post_views 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to update post likes count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post likes count
CREATE TRIGGER update_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration TEXT,
  level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  category TEXT,
  image_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  content TEXT,
  learning_objectives TEXT[],
  requirements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users NOT NULL
);

-- Create course enrollments table
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Enable RLS for courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policies for courses
CREATE POLICY "Anyone can view courses" 
  ON public.courses 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create courses" 
  ON public.courses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses" 
  ON public.courses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses" 
  ON public.courses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS for course enrollments
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies for course enrollments
CREATE POLICY "Anyone can view course enrollments" 
  ON public.course_enrollments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can enroll in courses" 
  ON public.course_enrollments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own enrollments" 
  ON public.course_enrollments 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create storage bucket for course images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-images', 'course-images', true);

-- Create policy for course images bucket
CREATE POLICY "Anyone can view course images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'course-images');

CREATE POLICY "Authenticated users can upload course images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'course-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own course images" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'course-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own course images" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'course-images' AND auth.uid()::text = (storage.foldername(name))[1]);
