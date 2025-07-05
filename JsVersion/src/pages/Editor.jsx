import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/shared/RichTextEditor";
import CategoryTagSelector from "@/components/shared/CategoryTagSelector";
import ImageUpload from "@/components/shared/ImageUpload";
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";
import { NavLink } from "react-router";
import { useAuth } from "@/store/auth";

const Editor = () => {
  const { user } = useAuth();

  const [postData, setPostData] = useState({
    title: "",
    content: "",
    cover_image_url: "",
    author_id: user?.id,
    slug: "",
    published: false,
    category_id: "",
    tags: [],
  });

  /**
   * 
   * 
   *  
      title
      content
      cover_image_url
      author_id
      slug
      published
      created_at
      updated_at
      category_id
   * 
   * 
   */

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <NavLink to={"/"}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </NavLink>
              <h1 className="text-xl font-semibold">Hana Editor</h1>
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
                      name="title"
                      value={postData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setPostData((prev) => ({
                          ...prev,
                          title,
                          slug: title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, ""),
                        }));
                      }}
                      placeholder="Enter your post title..."
                      className="text-lg"
                    />
                  </div>
                  <CategoryTagSelector
                    selectedCategory={postData.category_id}
                    selectedTags={postData.tags || []}
                    onCategoryChange={(value) =>
                      setPostData((prev) => ({ ...prev, category_id: value }))
                    }
                    onTagsChange={(updatedTags) =>
                      setPostData((prev) => ({ ...prev, tags: updatedTags }))
                    }
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cover Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    onImageUploaded={(url) =>
                      setPostData((prev) => ({ ...prev, cover_image_url: url }))
                    }
                    currentImage={postData.cover_image_url}
                    bucket="blog-images"
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
                    onChange={(e) =>
                      setPostData((prev) => ({ ...prev, content: e }))
                    }
                    placeholder="Start writing your post..."
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Minimum 100 characters required
                  </p>
                </CardContent>
              </Card>
              <button onClick={()=> console.log(postData)}>Check</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
