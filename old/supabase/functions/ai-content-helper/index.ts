
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, prompt } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'title':
        systemPrompt = 'You are a creative blog title generator. Generate 5 engaging, SEO-friendly titles based on the content provided. Return only a JSON array of strings.';
        userPrompt = `Generate blog titles for this content: ${content}`;
        break;
      case 'outline':
        systemPrompt = 'You are a content outliner. Create a structured outline for a blog post based on the topic provided. Return it as a JSON array of section objects with title and description.';
        userPrompt = `Create an outline for: ${prompt}`;
        break;
      case 'summary':
        systemPrompt = 'You are a content summarizer. Create a compelling 2-3 sentence summary/excerpt for this blog post content.';
        userPrompt = `Summarize this content: ${content}`;
        break;
      default:
        throw new Error('Invalid AI request type');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const result = data.choices[0].message.content;

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-content-helper function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
