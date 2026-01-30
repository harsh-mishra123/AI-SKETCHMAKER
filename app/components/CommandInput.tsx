'use client';

import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { EXAMPLE_PROMPTS, ART_STYLES } from '@/app/lib/prompts';

interface CommandInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

export default function CommandInput({ onGenerate, isLoading }: CommandInputProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('sketch');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      const fullPrompt = `${prompt} in ${selectedStyle} style`;
      onGenerate(fullPrompt);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    const fullPrompt = `${example} in ${selectedStyle} style`;
    onGenerate(fullPrompt);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <label htmlFor="prompt" className="text-sm font-medium text-gray-200">
              Describe your sketch
            </label>
          </div>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to draw (e.g., 'a cat wearing sunglasses surfing')"
            className="input-field w-full h-32 resize-none"
            disabled={isLoading}
            maxLength={500}
          />
          <div className="mt-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {prompt.length}/500 characters
            </span>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Generating...' : 'Generate Sketch'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-200">Art Style</label>
          <div className="flex flex-wrap gap-2">
            {ART_STYLES.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setSelectedStyle(style)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedStyle === style
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-200">Try these examples</label>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                disabled={isLoading}
                className="px-4 py-2 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 disabled:opacity-50 transition-all duration-300 text-sm border border-white/10 hover:border-indigo-500/30"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}