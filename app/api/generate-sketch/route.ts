import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/app/lib/gemini';

// Rate limiting storage (in-memory for simplicity, use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userData = rateLimit.get(ip);

  if (!userData) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (now > userData.resetTime) {
    // Reset window
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (userData.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  userData.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again in a minute.',
          code: 'RATE_LIMIT'
        },
        { status: 429 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { 
          error: 'Prompt is required and must be a string',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      );
    }

    const trimmedPrompt = prompt.trim();
    
    if (trimmedPrompt.length < 3) {
      return NextResponse.json(
        { 
          error: 'Prompt must be at least 3 characters long',
          code: 'PROMPT_TOO_SHORT'
        },
        { status: 400 }
      );
    }

    if (trimmedPrompt.length > 500) {
      return NextResponse.json(
        { 
          error: 'Prompt must be less than 500 characters',
          code: 'PROMPT_TOO_LONG'
        },
        { status: 400 }
      );
    }

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return NextResponse.json(
        { 
          error: 'Service configuration error',
          code: 'SERVICE_ERROR'
        },
        { status: 500 }
      );
    }

    console.log(`Generating sketch for prompt: "${trimmedPrompt.substring(0, 50)}..."`);
    
    // Generate SVG using Gemini
    const svgCode = await geminiService.generateSketch(trimmedPrompt);

    // Validate SVG response
    if (!svgCode || !svgCode.includes('<svg')) {
      console.error('Invalid SVG generated:', svgCode?.substring(0, 100));
      return NextResponse.json(
        { 
          error: 'Failed to generate valid sketch',
          code: 'INVALID_OUTPUT'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      svg: svgCode,
      prompt: trimmedPrompt,
      timestamp: new Date().toISOString(),
      model: 'gemini',
    });

  } catch (error: any) {
    console.error('API Error:', error);

    // Handle specific error types
    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      return NextResponse.json(
        { 
          error: 'Authentication error. Please check your API key.',
          code: 'AUTH_ERROR'
        },
        { status: 401 }
      );
    }

    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return NextResponse.json(
        { 
          error: 'API quota exceeded. Please try again later.',
          code: 'QUOTA_EXCEEDED'
        },
        { status: 429 }
      );
    }

    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return NextResponse.json(
        { 
          error: 'Model not available. Please try a different model.',
          code: 'MODEL_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate sketch',
        code: 'GENERATION_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Sketch Generator API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/generate-sketch',
      body: '{ "prompt": "your sketch description" }'
    },
    rate_limit: '10 requests per minute'
  });
}