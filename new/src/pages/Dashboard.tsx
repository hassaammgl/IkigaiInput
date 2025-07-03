
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { supabase } from '@/supabase/supabase';
import Navbar from '@/layout/Navbar';
import PostAnalytics from '@/components/shared/PostAnalytics';
import TrendingPosts from '@/components/shared/TrendingPosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { PenTool, Eye, MessageSquare, Calendar, TrendingUp, Edit } from 'lucide-react';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalComments: number;
}

interface PostStats {
  id: string;
  title: string;
  status: string;
  created_at: string;
  published_at: string | null;
  views: number;
  comments: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Author Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.email}!</p>
            </div>
            <Button asChild>
              <a href="/editor">
                <PenTool className="w-4 h-4 mr-2" />
                New Post
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Analytics Section */}
            <div className="lg:col-span-2 space-y-6">
              <PostAnalytics showUserStats={true} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <TrendingPosts limit={5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
