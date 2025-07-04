import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/shared/RichTextEditor";
import CategoryTagSelector from "@/components/shared/CategoryTagSelector";
import ImageUpload from "@/components/shared/ImageUpload";
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";

const dummyData = {
  title: "How to Use Next.js with Supabase",
  content: "This is a dummy post content. You can write your article here...",
  excerpt: "A quick guide on integrating Next.js with Supabase.",
  category: "Web Development",
  tags: ["nextjs", "supabase", "guide"],
  cover_image_url: "https://placehold.co/600x400",
};

const Editor = () => {
  const [postData, setPostData] = useState({
    ...dummyData,
  });

  const handleChange = (field, value) => {
    setPostData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold">
                Dummy Editor
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button disabled>
                <Send className="w-4 h-4 mr-2" />
                Publish
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
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={postData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Enter your post title..."
                      className="text-lg"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={postData.excerpt}
                      onChange={(e) => handleChange('excerpt', e.target.value)}
                      placeholder="Brief description of your post..."
                      rows={3}
                      disabled
                    />
                  </div>
                  <CategoryTagSelector
                    selectedCategory={postData.category}
                    selectedTags={postData.tags}
                    onCategoryChange={() => {}}
                    onTagsChange={() => {}}
                    // disabled
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cover Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    onImageUploaded={() => {}}
                    currentImage={postData.cover_image_url}
                    bucket="post-images"
                    // disabled
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content *</CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    content={postData.content}
                    onChange={() => {}}
                    placeholder="Start writing your post..."
                    // readOnly
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Minimum 100 characters required
                  </p>
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
