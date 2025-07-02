
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, RefreshCw, Copy } from 'lucide-react';

interface AiTitleSuggestionsProps {
  content: string;
  onSelectTitle: (title: string) => void;
}

const AiTitleSuggestions: React.FC<AiTitleSuggestionsProps> = ({
  content,
  onSelectTitle,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateTitles = async () => {
    if (!content.trim()) {
      toast({
        variant: 'destructive',
        title: 'No content',
        description: 'Write some content first to generate title suggestions.',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-helper', {
        body: {
          type: 'title',
          content: content.substring(0, 1000), // Limit content for API
        },
      });

      if (error) throw error;

      const titles = JSON.parse(data.result);
      setSuggestions(titles);
    } catch (error) {
      console.error('Error generating titles:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to generate title suggestions.',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!content.trim()) {
      toast({
        variant: 'destructive',
        title: 'No content',
        description: 'Write some content first to generate a summary.',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-helper', {
        body: {
          type: 'summary',
          content: content.substring(0, 2000),
        },
      });

      if (error) throw error;

      toast({
        title: 'Summary Generated',
        description: 'Check your excerpt field for the AI-generated summary.',
      });

      // You can emit this summary to parent component if needed
      console.log('Generated summary:', data.result);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to generate summary.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button
              onClick={generateTitles}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Titles
            </Button>
            <Button
              onClick={generateSummary}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
              Generate Summary
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Title Suggestions:</h4>
              {suggestions.map((title, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onSelectTitle(title)}
                >
                  <p className="text-sm">{title}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AiTitleSuggestions;
