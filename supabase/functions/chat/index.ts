// @ts-ignore: Unreachable code error
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: Message[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ALIYUN_API_KEY = Deno.env.get('ALIYUN_API_KEY');
    
    if (!ALIYUN_API_KEY) {
      throw new Error('API key not configured');
    }

    let requestData: ChatRequest;
    try {
      requestData = await req.json();
    } catch (e) {
      throw new Error('Invalid JSON in request body');
    }

    const { messages } = requestData;

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    // 调用 AI API
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ALIYUN_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-SSE': 'disable',
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: {
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        },
        parameters: {
          result_format: 'message',
          seed: Math.floor(Math.random() * 1000000),
          max_tokens: 1500,
          temperature: 0.7,
          top_p: 0.8,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get response from AI service');
    }

    const data = await response.json();

    // Ensure we have a valid response structure
    if (!data.output?.text) {
      // If the response doesn't match our expected format, try to extract text from the Alibaba Cloud response format
      const text = data.output?.message?.content || data.output?.choices?.[0]?.message?.content;
      if (text) {
        return new Response(
          JSON.stringify({
            output: { text }
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      throw new Error('Invalid response format from AI service');
    }

    return new Response(
      JSON.stringify({
        output: {
          text: data.output.text,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in chat function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        output: { 
          text: 'An error occurred while processing your request. Please try again.' 
        }
      }),
      {
        status: error.message === 'API key not configured' ? 503 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});