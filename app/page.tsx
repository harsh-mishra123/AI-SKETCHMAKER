'use client';

import { useState, useEffect } from 'react';
import { Palette, Zap, Shield } from 'lucide-react';
import CommandInput from './components/CommandInput';
import SketchCanvas from './components/SketchCanvas';
import Gallery from './components/Gallery';
import LoadingSpinner from './components/LoadingSpinner';

interface Sketch {
  id: string;
  svg: string;
  prompt: string;
  timestamp: string;
}

export default function Home() {
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [currentSketch, setCurrentSketch] = useState<Sketch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load saved sketches from localStorage
    const savedSketches = localStorage.getItem('aiSketches');
    if (savedSketches) {
      try {
        setSketches(JSON.parse(savedSketches));
      } catch (e) {
        console.error('Failed to load sketches:', e);
      }
    }
  }, []);

  const saveSketch = (sketch: Sketch) => {
    const updatedSketches = [sketch, ...sketches.slice(0, 9)]; // Keep last 10
    setSketches(updatedSketches);
    localStorage.setItem('aiSketches', JSON.stringify(updatedSketches));
  };

  const generateSketch = async (prompt: string) => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch('/api/generate-sketch', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle different error types
      switch (data.code) {
        case 'RATE_LIMIT':
          throw new Error('Too many requests. Please wait a minute before trying again.');
        case 'QUOTA_EXCEEDED':
          throw new Error('API quota exceeded. Please try again later.');
        case 'AUTH_ERROR':
          throw new Error('Service authentication error. Please check configuration.');
        case 'MODEL_NOT_FOUND':
          throw new Error('AI model is currently unavailable. Please try again in a few moments.');
        case 'PROMPT_TOO_SHORT':
        case 'PROMPT_TOO_LONG':
        case 'INVALID_INPUT':
          throw new Error(data.error || 'Invalid input provided.');
        default:
          throw new Error(data.error || 'Failed to generate sketch. Please try again.');
      }
    }

    const newSketch: Sketch = {
      id: Date.now().toString(),
      svg: data.svg,
      prompt: data.prompt,
      timestamp: data.timestamp,
    };

    setCurrentSketch(newSketch);
    saveSketch(newSketch);
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    setError(errorMessage);
    
    // Log error for debugging
    console.error('Generation error:', err);
    
  } finally {
    setIsLoading(false);
  }
};

  const handleRegenerate = () => {
    if (currentSketch) {
      generateSketch(currentSketch.prompt);
    }
  };

  const deleteSketch = (id: string) => {
    const updatedSketches = sketches.filter(sketch => sketch.id !== id);
    setSketches(updatedSketches);
    localStorage.setItem('aiSketches', JSON.stringify(updatedSketches));
    
    if (currentSketch?.id === id) {
      setCurrentSketch(updatedSketches[0] || null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-white/10 animate-fade-in">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AI Sketch Generator
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>Powered by Gemini AI</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>No sign-up required</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-gray-400 text-sm">
            Describe anything, and watch AI create it as an artistic sketch
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input */}
          <div className="lg:col-span-2 animate-fade-in">
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-gray-100 mb-6">
                Create Your Sketch
              </h2>
              
              <CommandInput 
                onGenerate={generateSketch} 
                isLoading={isLoading}
              />

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                  <p className="text-red-400 font-medium">{error}</p>
                  <p className="text-sm text-red-300/70 mt-1">
                    Please try again or use a different description
                  </p>
                </div>
              )}
            </div>

            {/* Current Sketch Display */}
            {currentSketch && !isLoading && (
              <SketchCanvas
                svgCode={currentSketch.svg}
                prompt={currentSketch.prompt}
                onRegenerate={handleRegenerate}
              />
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="card p-12 text-center">
                <LoadingSpinner />
              </div>
            )}
          </div>

          {/* Right Column - Gallery */}
          <div className="animate-fade-in">
            <div className="card sticky top-8">
              <h2 className="text-xl font-bold text-gray-100 mb-4">
                Recent Sketches
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                kisi bhi sketch ko select karne ke liye us par click karein
              </p>
              
              <Gallery
                sketches={sketches}
                onSelectSketch={(sketch) => {
                  setCurrentSketch(sketch);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDeleteSketch={deleteSketch}
              />

              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="font-medium text-gray-200 mb-3">Tips</h3>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>Be specific with descriptions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Try adding style keywords</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>Use example prompts for inspiration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Regenerate for variations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="glass border-t border-white/10 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>
              Created with bakchodi and info 
              <a 
                href="https://github.com/harsh-mishra123" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors ml-1"
              >
                Bhai ka github
              </a>
            </p>
            <p className="mt-2 md:mt-0">
              All sketches are generated by AI,SVG format for easy editing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}