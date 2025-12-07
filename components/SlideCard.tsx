import React from 'react';
import { SlideData } from '../types';
import { Trash2, RefreshCw, AlertCircle, CheckCircle2, FileImage } from 'lucide-react';

interface SlideCardProps {
  slide: SlideData;
  onRemove: (id: string) => void;
  index: number;
}

export const SlideCard: React.FC<SlideCardProps> = ({ slide, onRemove, index }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group transition-all hover:shadow-md">
      {/* Image Preview Area */}
      <div className="relative h-48 bg-slate-100 w-full overflow-hidden">
        <img 
          src={slide.previewUrl} 
          alt={`Slide ${index + 1}`} 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-2 right-2 flex gap-2">
            <button 
                onClick={() => onRemove(slide.id)}
                className="p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                title="Remove slide"
            >
                <Trash2 size={16} />
            </button>
        </div>

        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-white text-xs font-medium">
            Slide {index + 1}
        </div>
      </div>

      {/* AI Content Area */}
      <div className="p-4 flex-1 flex flex-col">
        {slide.status === 'analyzing' && (
          <div className="flex items-center gap-2 text-indigo-600 text-sm animate-pulse mb-2">
            <RefreshCw size={16} className="animate-spin" />
            <span className="font-medium">Gemini is thinking...</span>
          </div>
        )}

        {slide.status === 'error' && (
          <div className="flex items-center gap-2 text-red-500 text-sm mb-2">
            <AlertCircle size={16} />
            <span>Analysis failed</span>
          </div>
        )}

        {slide.status === 'success' && slide.content && (
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wide">
                <CheckCircle2 size={12} />
                <span>AI Generated</span>
             </div>
             <h3 className="font-bold text-slate-800 leading-tight">{slide.content.title}</h3>
             <ul className="space-y-1">
                {slide.content.points.map((point, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-1.5">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0"></span>
                        <span className="line-clamp-2">{point}</span>
                    </li>
                ))}
             </ul>
          </div>
        )}

        {slide.status === 'idle' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-4">
                <FileImage size={24} className="mb-2 opacity-50"/>
                <span className="text-sm">Ready to analyze</span>
            </div>
        )}
      </div>
    </div>
  );
};