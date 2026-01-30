import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateSketch(prompt: string): Promise<string> {
    try {
      // Use the latest stable model
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
      });

      const systemPrompt = `You are an expert SVG artist. Generate ONLY valid SVG code for: ${prompt}

CRITICAL RULES:
- Output ONLY the SVG code, no explanations or markdown
- Use viewBox="0 0 800 600"
- Create artistic sketch-like drawings
- Use simple shapes and paths
- Keep it monochrome or 2-3 colors max
- Add artistic imperfections for sketch effect

Generate the SVG now:`;

      const result = await model.generateContent(systemPrompt);
      const response = result.response;
      const text = response.text();
      
      // Clean up and extract SVG
      return this.extractSVGCode(text);
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      
      // Provide specific error messages
      if (error.message?.includes('API key')) {
        throw new Error('Invalid API key. Please check your GEMINI_API_KEY in .env.local');
      }
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment');
      }
      if (error.status === 503 || error.status === 500) {
        throw new Error('Gemini service is temporarily unavailable. Please try again');
      }
      
      throw new Error(`Failed to generate sketch: ${error.message || 'Unknown error'}`);
    }
  }

  private extractSVGCode(text: string): string {
    // Remove any markdown code blocks
    let cleanText = text.replace(/```(xml|svg)?/g, '').replace(/```/g, '').trim();
    
    // Look for SVG tags
    const svgMatch = cleanText.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      return svgMatch[0];
    }
    
    // If no SVG tags found, check if it's valid XML starting with <svg
    if (cleanText.startsWith('<svg') || cleanText.includes('<svg')) {
      // Find the start of SVG tag
      const svgStart = cleanText.indexOf('<svg');
      const svgEnd = cleanText.lastIndexOf('</svg>') + 6;
      if (svgStart !== -1 && svgEnd !== -1) {
        return cleanText.substring(svgStart, svgEnd);
      }
    }
    
    // Fallback: create a simple SVG
    console.warn('No valid SVG found in response, creating fallback');
    return this.createFallbackSVG(cleanText);
  }

  private createFallbackSVG(message: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#f8f9fa"/>
  <circle cx="400" cy="300" r="150" fill="none" stroke="#e9ecef" stroke-width="2" stroke-dasharray="5,5"/>
  <circle cx="400" cy="300" r="100" fill="none" stroke="#dee2e6" stroke-width="2" stroke-dasharray="5,5"/>
  <rect x="250" y="200" width="300" height="200" rx="10" fill="white" stroke="#0ea5e9" stroke-width="3"/>
  <circle cx="400" cy="280" r="30" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="400" y="285" text-anchor="middle" fill="#92400e" font-family="Arial, sans-serif" font-size="24" font-weight="bold">!</text>
  <text x="400" y="340" text-anchor="middle" fill="#374151" font-family="Arial, sans-serif" font-size="16">
    ${message.substring(0, 50)}...
  </text>
  <line x1="300" y1="370" x2="500" y2="370" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="10,5"/>
</svg>`;
  }
}

export const geminiService = new GeminiService();