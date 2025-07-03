import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/store/auth';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/supabase/supabase';
import RichTextEditor from '@/components/shared/RichTextEditor';
import CategoryTagSelector from '@/components/shared/CategoryTagSelector';
import ImageUpload from '@/components/shared/ImageUpload';
import slugify from 'slugify';
import { ArrowLeft, Save, Send } from 'lucide-react';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success,error:err } = useToast();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Load existing post if editing
  useEffect(() => {
    if (id && user) {
      loadPost();
    }
  }, [id, user]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setTitle(data.title);
      setContent(data.content || '');
      setExcerpt(data.excerpt || '');
      setCategory(data.category || '');
      setTags(data.tags || []);
    } catch (error) {
      console.error('Error loading post:', error);
      err('Failed to load post.');
      navigate('/');
    }
  };

  const generateSlug = (title: string) => {
    return slugify(title, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
    });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const saveDraft = async () => {
    if (!user || !title.trim()) return;

    setIsSaving(true);
    try {
      const slug = generateSlug(title);
      const readTime = calculateReadTime(content);
      const postData = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim(),
        slug,
        category: category || null,
        tags: tags.length > 0 ? tags : null,
        author_name: user.email,
        read_time: readTime,
        status: 'draft',
        user_id: user.id,
        cover_image_url: coverImageUrl || null,
      };

      if (id) {
        // Update existing post
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('posts')
          .insert([postData])
          .select()
          .single();

        if (error) throw error;
        
        // Navigate to edit the newly created post
        navigate(`/editor/${data.id}`, { replace: true });
      }

      success('Your post has been saved as a draft.');
    } catch (error) {
      console.error('Error saving draft:', error);
      success('Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const publishPost = async () => {
    if (!user || !title.trim()) return;

    setIsLoading(true);
    try {
      const slug = generateSlug(title);
      const readTime = calculateReadTime(content);
      const postData = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim(),
        slug,
        category: category || null,
        tags: tags.length > 0 ? tags : null,
        author_name: user.email,
        read_time: readTime,
        status: 'published',
        published_at: new Date().toISOString(),
        user_id: user.id,
        cover_image_url: coverImageUrl || null,
      };

      if (id) {
        // Update existing post
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new post
        const { error } = await supabase
          .from('posts')
          .insert([postData]);

        if (error) throw error;
      }

     success('Your post is now live.');
      
      navigate('/');
    } catch (error) {
      console.error('Error publishing post:', error);
      err('Failed to publish post.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold">
                {id ? 'Edit Post' : 'New Post'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={saveDraft}
                disabled={isSaving || !title.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                onClick={publishPost}
                disabled={isLoading || !title.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Post Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter your post title..."
                      className="text-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="excerpt">Excerpt (optional)</Label>
                    <Textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="A brief description of your post..."
                      rows={3}
                    />
                  </div>
                  <CategoryTagSelector
                    selectedCategory={category}
                    selectedTags={tags}
                    onCategoryChange={setCategory}
                    onTagsChange={setTags}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cover Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    onImageUploaded={setCoverImageUrl}
                    currentImage={coverImageUrl}
                    bucket="post-images"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Start writing your post..."
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
