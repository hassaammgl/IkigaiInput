
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Clock, Users, Star, BookOpen, Play } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  price: number;
  duration: string;
  level: string;
  category: string;
  image_url: string;
  rating: number;
  students_count: number;
  created_at: string;
  user_id: string;
  content: string;
  learning_objectives: string[];
  requirements: string[];
}

interface Instructor {
  id: string;
  display_name: string;
  avatar_url: string;
  bio: string;
}

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) {
        if (courseError.code === 'PGRST116') {
          navigate('/404');
          return;
        }
        throw courseError;
      }

      setCourse(courseData);

      // Load instructor profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, bio')
        .eq('id', courseData.user_id)
        .single();

      if (!profileError) {
        setInstructor(profileData);
      }

      // Check if user is enrolled
      if (user) {
        const { data: enrollmentData } = await supabase
          .from('course_enrollments')
          .select('id')
          .eq('course_id', id)
          .eq('user_id', user.id)
          .single();

        setEnrolled(!!enrollmentData);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to enroll in courses.',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: course!.id,
          user_id: user.id,
        });

      if (error) throw error;

      // Update students count
      await supabase
        .from('courses')
        .update({ students_count: course!.students_count + 1 })
        .eq('id', course!.id);

      setEnrolled(true);
      setCourse(prev => prev ? { ...prev, students_count: prev.students_count + 1 } : null);
      
      toast({
        title: 'Enrollment successful!',
        description: 'You have successfully enrolled in this course.',
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        variant: 'destructive',
        title: 'Enrollment failed',
        description: 'Failed to enroll in course. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/courses')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img
                src={course.image_url || '/placeholder.svg'}
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge className="bg-primary text-primary-foreground">
                  {course.level}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                {course.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.students_count} students
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  {course.rating}
                </div>
              </div>
            </div>

            {/* Course Content */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {course.content ? (
                    <div dangerouslySetInnerHTML={{ __html: course.content }} />
                  ) : (
                    <p className="text-muted-foreground">
                      Course content will be available after enrollment.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Learning Objectives */}
            {course.learning_objectives && course.learning_objectives.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.learning_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <BookOpen className="w-4 h-4 mr-2 mt-0.5 text-primary" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="text-sm">
                        • {requirement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Instructor */}
            {instructor && (
              <Card>
                <CardHeader>
                  <CardTitle>Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={instructor.avatar_url || ''} />
                      <AvatarFallback>
                        {instructor.display_name?.[0] || course.instructor_name?.[0] || 'I'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {instructor.display_name || course.instructor_name}
                      </h3>
                      {instructor.bio && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {instructor.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-2">
                    ${course.price}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    One-time payment
                  </p>
                </div>

                {enrolled ? (
                  <Button className="w-full mb-4" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Button>
                ) : (
                  <Button 
                    className="w-full mb-4" 
                    size="lg"
                    onClick={handleEnroll}
                    disabled={!user}
                  >
                    {user ? 'Enroll Now' : 'Sign In to Enroll'}
                  </Button>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level:</span>
                    <span>{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Students:</span>
                    <span>{course.students_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {course.rating}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
