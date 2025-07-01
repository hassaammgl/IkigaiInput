
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';
import { ArrowLeft, Save, Send, Plus, X } from 'lucide-react';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [learningObjectives, setLearningObjectives] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const addObjective = () => {
    setLearningObjectives([...learningObjectives, '']);
  };

  const removeObjective = (index: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
  };

  const updateObjective = (index: number, value: string) => {
    const updated = [...learningObjectives];
    updated[index] = value;
    setLearningObjectives(updated);
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'Please sign in to create a course.',
      });
      return;
    }

    if (!title.trim() || !description.trim() || !price || !duration || !category) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const courseData = {
        title: title.trim(),
        description: description.trim(),
        content,
        price: parseFloat(price),
        duration: duration.trim(),
        level,
        category: category.trim(),
        image_url: imageUrl,
        instructor_name: user.email,
        user_id: user.id,
        learning_objectives: learningObjectives.filter(obj => obj.trim()),
        requirements: requirements.filter(req => req.trim()),
        rating: 0,
        students_count: 0,
      };

      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Course created!',
        description: 'Your course has been created successfully.',
      });
      
      navigate(`/courses/${data.id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create course. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
              <p className="text-muted-foreground">
                Please sign in to create a course.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/courses')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
            <h1 className="text-2xl font-bold">Create New Course</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter course title..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your course..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration *</Label>
                    <Input
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 4 weeks, 20 hours"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level">Level *</Label>
                    <select
                      id="level"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      required
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Programming, Design, Business"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Image */}
            <Card>
              <CardHeader>
                <CardTitle>Course Image</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImageUploaded={setImageUrl}
                  currentImage={imageUrl}
                  bucket="course-images"
                />
              </CardContent>
            </Card>

            {/* Learning Objectives */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Objectives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningObjectives.map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      placeholder="What will students learn?"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeObjective(index)}
                      disabled={learningObjectives.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addObjective}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Learning Objective
                </Button>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder="What do students need to know?"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                      disabled={requirements.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRequirement}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Requirement
                </Button>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your course content here..."
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Course'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
