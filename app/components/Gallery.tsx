'use client';

import { useState } from 'react';
import { Trash2, Eye } from 'lucide-react';

interface SketchItem {
  id: string;
  svg: string;
  prompt: string;
  timestamp: string;
}

interface GalleryProps {
  sketches: SketchItem[];
  onSelectSketch: (sketch: SketchItem) => void;
  onDeleteSketch: (id: string) => void;
}

export default function Gallery({ sketches, onSelectSketch, onDeleteSketch }: GalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (sketches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2 text-lg">No sketches yet, try making one</div>
        <p className="text-gray-500 text-sm">Generate your first sketch to see it here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sketches.map((sketch) => (
        <div
          key={sketch.id}
          className={`glass rounded-xl overflow-hidden transition-all duration-300 hover:bg-white/10 group ${
            selectedId === sketch.id ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20' : ''
          }`}
        >
          <div 
            className="h-32 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 cursor-pointer transition-transform duration-300 group-hover:scale-105"
            onClick={() => {
              setSelectedId(sketch.id);
              onSelectSketch(sketch);
            }}
            dangerouslySetInnerHTML={{ __html: sketch.svg }}
          />
          
          <div className="p-3">
            <p className="text-sm text-gray-300 mb-2 truncate">{sketch.prompt}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {new Date(sketch.timestamp).toLocaleTimeString()}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => onSelectSketch(sketch)}
                  className="p-2 text-gray-400 hover:text-indigo-400 transition-all duration-300 rounded-lg hover:bg-white/5 active:scale-95 transform"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteSketch(sketch.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-all duration-300 rounded-lg hover:bg-white/5 active:scale-95 transform"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
