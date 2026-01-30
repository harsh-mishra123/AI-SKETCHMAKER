import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI Sketch Generator',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    gemini_configured: !!process.env.GEMINI_API_KEY,
    uptime: process.uptime(),
  };

  return NextResponse.json(health);
}