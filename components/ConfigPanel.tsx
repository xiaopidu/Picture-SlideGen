import React from 'react';
import { LayoutTemplate, AlignLeft, AlignRight, Maximize, Type, List } from 'lucide-react';
import { PresentationSettings, SlideLayout } from '../types';

interface ConfigPanelProps {
  settings: PresentationSettings;
  onUpdate: (settings: PresentationSettings) => void;
  disabled?: boolean;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ settings, onUpdate, disabled }) => {
  
  const handleLayoutChange = (layout: SlideLayout) => {
    onUpdate({ ...settings, layout });
  };

  const toggleSetting = (key: keyof Pick<PresentationSettings, 'includeTitle' | 'includePoints'>) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
        <LayoutTemplate className="text-indigo-600" size={20} />
        <h3 className="font-semibold text-slate-800">Presentation Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Layout Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-500 uppercase tracking-wider">Image Layout</label>
          <div className="flex gap-3">
            <button
              onClick={() => handleLayoutChange('left')}
              disabled={disabled}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                settings.layout === 'left' 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <AlignLeft size={24} />
              <span className="text-xs font-medium">Left</span>
            </button>
            
            <button
              onClick={() => handleLayoutChange('right')}
              disabled={disabled}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                settings.layout === 'right' 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <AlignRight size={24} />
              <span className="text-xs font-medium">Right</span>
            </button>

            <button
              onClick={() => handleLayoutChange('fullscreen')}
              disabled={disabled}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                settings.layout === 'fullscreen' 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Maximize size={24} />
              <span className="text-xs font-medium">Full Screen</span>
            </button>
          </div>
        </div>

        {/* Content Options */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-500 uppercase tracking-wider">Content Visibility</label>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => toggleSetting('includeTitle')}
              disabled={disabled}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                settings.includeTitle 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${settings.includeTitle ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                {settings.includeTitle && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <Type size={18} />
              <span className="text-sm font-medium">Include Title</span>
            </button>

            <button
              onClick={() => toggleSetting('includePoints')}
              disabled={disabled}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                settings.includePoints 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
               <div className={`w-5 h-5 rounded border flex items-center justify-center ${settings.includePoints ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                {settings.includePoints && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <List size={18} />
              <span className="text-sm font-medium">Include Bullet Points</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};