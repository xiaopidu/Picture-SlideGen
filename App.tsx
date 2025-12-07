import React, { useState, useCallback } from 'react';
import { UploadZone } from './components/UploadZone';
import { SlideCard } from './components/SlideCard';
import { ConfigPanel } from './components/ConfigPanel';
import { SlideData, PresentationSettings } from './types';
import { generateId } from './services/utils';
import { analyzeImage } from './services/geminiService';
import { generatePPTX } from './services/pptService';
import { generatePDF } from './services/pdfService';
import { Sparkles, Download, Presentation, Trash2, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExportingPPT, setIsExportingPPT] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  // Presentation Settings State
  const [settings, setSettings] = useState<PresentationSettings>({
    layout: 'left',
    includeTitle: true,
    includePoints: true
  });

  const handleFilesSelected = useCallback((files: File[]) => {
    const newSlides: SlideData[] = files.map(file => ({
      id: generateId(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'idle'
    }));
    setSlides(prev => [...prev, ...newSlides]);
  }, []);

  const removeSlide = useCallback((id: string) => {
    setSlides(prev => {
        const slideToRemove = prev.find(s => s.id === id);
        if (slideToRemove) {
            URL.revokeObjectURL(slideToRemove.previewUrl);
        }
        return prev.filter(s => s.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    slides.forEach(s => URL.revokeObjectURL(s.previewUrl));
    setSlides([]);
  }, [slides]);

  const analyzeSlides = async () => {
    if (slides.length === 0) return;
    
    setIsAnalyzing(true);
    
    const slidesToProcess = slides.filter(s => s.status === 'idle' || s.status === 'error');

    for (const slide of slidesToProcess) {
        setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, status: 'analyzing' } : s));
        
        try {
            const content = await analyzeImage(slide.file);
            setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, status: 'success', content } : s));
        } catch (error) {
            setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, status: 'error', error: 'Failed' } : s));
        }
    }
    
    setIsAnalyzing(false);
  };

  const handleExportPPT = async () => {
    setIsExportingPPT(true);
    try {
        await generatePPTX(slides, settings);
    } catch (e) {
        console.error("Export failed", e);
        alert("Failed to generate PPTX");
    } finally {
        setIsExportingPPT(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
        await generatePDF(slides, settings);
    } catch (e) {
        console.error("Export failed", e);
        alert("Failed to generate PDF");
    } finally {
        setIsExportingPDF(false);
    }
  };

  const hasPendingAnalysis = slides.some(s => s.status === 'idle' || s.status === 'error');
  const hasSlides = slides.length > 0;
  const isBusy = isAnalyzing || isExportingPPT || isExportingPDF;

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Presentation size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Gemini <span className="text-indigo-600">SlideGen</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
             {hasSlides && (
                 <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {slides.length} {slides.length === 1 ? 'Slide' : 'Slides'}
                 </span>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Intro / Empty State */}
        {!hasSlides && (
            <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Turn images into presentations <span className="text-indigo-600">instantly</span>.</h2>
                <p className="text-lg text-slate-600">
                    Upload your photos, screenshots, or diagrams. Gemini will analyze them and generate formatted slides with titles and bullet points automatically.
                </p>
            </div>
        )}

        {/* Upload Area */}
        <div className="mb-8">
            <UploadZone onFilesSelected={handleFilesSelected} disabled={isAnalyzing} />
        </div>

        {/* Configuration Panel - Only show if we have slides */}
        {hasSlides && (
            <ConfigPanel 
                settings={settings} 
                onUpdate={setSettings} 
                disabled={isBusy}
            />
        )}

        {/* Actions Toolbar */}
        {hasSlides && (
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={clearAll} 
                        disabled={isBusy}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        Clear All
                    </button>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={analyzeSlides}
                        disabled={isAnalyzing || !hasPendingAnalysis}
                        className={`
                            flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm
                            ${isAnalyzing || !hasPendingAnalysis 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}
                        `}
                    >
                        {isAnalyzing ? (
                            <>
                                <Sparkles size={16} className="animate-spin" />
                                Analyzing Images...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                {hasPendingAnalysis ? 'Analyze with Gemini' : 'Analysis Complete'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}

        {/* Slides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((slide, index) => (
                <SlideCard 
                    key={slide.id} 
                    slide={slide} 
                    index={index}
                    onRemove={removeSlide}
                />
            ))}
        </div>
      </main>

      {/* Sticky Bottom Bar for Export */}
      {hasSlides && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-40">
              <div className="max-w-6xl mx-auto flex justify-end gap-4">
                   <button
                        onClick={handleExportPDF}
                        disabled={isBusy}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isExportingPDF ? (
                             <>Downloading...</>
                        ) : (
                             <>
                                <FileText size={20} className="text-red-500" />
                                PDF
                             </>
                        )}
                    </button>

                   <button
                        onClick={handleExportPPT}
                        disabled={isBusy}
                        className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                    >
                        {isExportingPPT ? (
                             <>Downloading...</>
                        ) : (
                             <>
                                <Presentation size={20} className="text-orange-400" />
                                PowerPoint
                             </>
                        )}
                    </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;