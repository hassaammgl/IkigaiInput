
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Copy, Check } from 'lucide-react';

interface AiTitleSuggestionsProps {
  content: string;
  onSelectTitle: (title: string) => void;
}

const AiTitleSuggestions: React.FC<AiTitleSuggestionsProps> = ({
  content,
  onSelectTitle,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const generateSuggestions = async () => {
    if (!content.trim()) {
      toast({
        variant: 'destructive',
        title: 'No content',
        description: 'Please add some content to generate title suggestions.',
      });
      return;
    }

    setIsLoading(true);
    try {
      // For demo purposes, using a mock API call
      // In production, you would integrate with Gemini API
      const mockSuggestions = [
        'Mastering the Art of Creative Writing',
        '5 Essential Tips for Better Blog Posts',
        'The Ultimate Guide to Content Creation',
        'From Idea to Published: A Writer\'s Journey',
        'Unlocking Your Creative Potential Today',
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuggestions(mockSuggestions);

      toast({
        title: 'Suggestions generated!',
        description: 'Click on any title to use it for your post.',
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate title suggestions.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTitle = async (title: string, index: number) => {
    try {
      await navigator.clipboard.writeText(title);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      
      toast({
        title: 'Copied!',
        description: 'Title copied to clipboard.',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Title Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={generateSuggestions} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Generating...' : 'Generate Title Ideas'}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map((title, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span
                  className="flex-1 cursor-pointer hover:text-primary"
                  onClick={() => onSelectTitle(title)}
                >
                  {title}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Click to use
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyTitle(title, index)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiTitleSuggestions;
