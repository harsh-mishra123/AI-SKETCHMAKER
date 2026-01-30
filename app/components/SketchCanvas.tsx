'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, Copy } from 'lucide-react';

interface SketchCanvasProps {
  svgCode: string;
  prompt: string;
  onRegenerate?: () => void;
}

export default function SketchCanvas({ svgCode, prompt, onRegenerate }: SketchCanvasProps) {
  const [copied, setCopied] = useState(false);

  const downloadSVG = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sketch-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copySVGCode = async () => {
    try {
      await navigator.clipboard.writeText(svgCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadPNG = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 900;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `sketch-${Date.now()}.png`;
        a.click();
      }
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(svgCode)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Your Sketch</h3>
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-200 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10 active:scale-95 transform"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 min-h-[400px] flex items-center justify-center border border-white/5">
          <div 
            className="max-w-full max-h-[500px] overflow-auto"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />
        </div>
        
        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-sm text-gray-300">
            <span className="font-medium text-indigo-400">Prompt:</span> {prompt}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={downloadSVG}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download SVG
        </button>
        
        <button
          onClick={downloadPNG}
          className="btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PNG
        </button>
        
        <button
          onClick={copySVGCode}
          className="btn-secondary flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy SVG Code'}
        </button>
      </div>

      <div className="glass rounded-xl p-4">
        <h4 className="font-medium text-gray-200 mb-3">SVG Code Preview</h4>
        <pre className="text-xs bg-black/30 text-gray-300 p-4 rounded-lg overflow-auto max-h-40 border border-white/5">
          {svgCode.substring(0, 500)}...
        </pre>
      </div>
    </div>
  );
}