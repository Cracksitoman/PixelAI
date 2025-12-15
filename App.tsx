import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wand2, 
  Download, 
  Trash2, 
  History, 
  Layers, 
  Image as ImageIcon, 
  Palette,
  Loader2,
  Sparkles,
  Menu,
  X,
  Film,
  Swords
} from 'lucide-react';
import { generateSprite } from './services/geminiService';
import { ArtStyle, GenerationConfig, SpriteType, GeneratedSprite } from './types';

// --- Components ---

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => (
  <header className="border-b border-white/10 bg-dark-900/50 backdrop-blur-md sticky top-0 z-30">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center shadow-lg shadow-accent-600/20">
          <Wand2 className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent font-pixel text-sm md:text-base">
          PixelForge AI
        </h1>
      </div>
      <button 
        onClick={toggleSidebar}
        className="p-2 hover:bg-white/5 rounded-lg md:hidden transition-colors"
      >
        <Menu className="w-6 h-6 text-gray-400" />
      </button>
    </div>
  </header>
);

const Sidebar = ({ 
  history, 
  onSelect, 
  onDelete, 
  isOpen, 
  onClose 
}: { 
  history: GeneratedSprite[]; 
  onSelect: (sprite: GeneratedSprite) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Content */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 bg-dark-800 border-r border-white/10 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-300">
            <History className="w-4 h-4" />
            <span className="font-semibold text-sm">History</span>
          </div>
          <button onClick={onClose} className="md:hidden p-1 hover:text-white text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              <p className="text-sm">No sprites yet.</p>
              <p className="text-xs mt-2">Create something awesome!</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  if (window.innerWidth < 768) onClose();
                }}
                className="group relative p-2 rounded-xl bg-dark-900/50 border border-white/5 hover:border-accent-600/50 hover:bg-dark-900 transition-all cursor-pointer flex gap-3 items-center"
              >
                <div className="w-12 h-12 rounded-lg bg-black/40 overflow-hidden flex-shrink-0">
                  <img src={item.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-300 truncate">{item.prompt}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.style}</p>
                </div>
                <button
                  onClick={(e) => onDelete(item.id, e)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 rounded-md transition-all text-gray-600"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};

const GeneratorForm = ({ 
  onSubmit, 
  isLoading,
  referenceSprite,
  onClearReference
}: { 
  onSubmit: (config: GenerationConfig) => void;
  isLoading: boolean;
  referenceSprite: GeneratedSprite | null;
  onClearReference: () => void;
}) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.PIXEL_ART);
  const [type, setType] = useState<SpriteType>(SpriteType.SINGLE_CHARACTER);
  const [bgColor, setBgColor] = useState('#202020');

  // Update style automatically if reference changes, but allow user override
  useEffect(() => {
    if (referenceSprite) {
      setStyle(referenceSprite.style);
      // Reset prompt to be action-oriented
      setPrompt("");
    }
  }, [referenceSprite]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit({ 
      prompt, 
      style, 
      type, 
      backgroundColor: bgColor,
      referenceImage: referenceSprite?.imageUrl
    });
  };

  const suggestions = referenceSprite 
    ? [
        "Walking cycle side view",
        "Attacking with sword",
        "Jump animation frames",
        "Taking damage pose"
      ]
    : [
        "Cyberpunk street samurai with a glowing katana",
        "Cute slime monster, blue, happy expression",
        "Medieval potion bottle with magical swirls",
        "Isometric treasure chest, gold and wood"
      ];

  return (
    <div className="bg-dark-800 rounded-2xl border border-white/10 p-6 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Reference Image Indicator */}
        {referenceSprite && (
          <div className="bg-accent-600/10 border border-accent-600/30 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-black overflow-hidden border border-accent-500/50">
                <img src={referenceSprite.imageUrl} className="w-full h-full object-cover" alt="Ref" />
              </div>
              <div>
                <p className="text-xs font-bold text-accent-300 uppercase tracking-wide">Using Character Reference</p>
                <p className="text-[10px] text-gray-400">AI will keep consistency</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={onClearReference}
              className="p-1.5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
              title="Remove Reference"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {referenceSprite ? "What action should they do?" : "Describe your sprite"}
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={referenceSprite ? "e.g., Running, Casting a spell, Dying animation..." : "e.g., A floating robot companion..."}
              className="w-full h-32 bg-dark-900 border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-accent-600 focus:border-transparent transition-all resize-none"
              disabled={isLoading}
            />
            <div className="absolute bottom-3 right-3">
               <Sparkles className={`w-4 h-4 ${prompt ? 'text-accent-500' : 'text-gray-700'}`} />
            </div>
          </div>
          {/* Suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(s)}
                className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 px-3 py-1.5 rounded-full transition-colors border border-white/5"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5" /> Art Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as ArtStyle)}
              className="w-full bg-dark-900 border border-white/10 text-gray-300 rounded-lg p-3 focus:ring-1 focus:ring-accent-600 outline-none"
            >
              {Object.values(ArtStyle).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Sprite Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as SpriteType)}
              className="w-full bg-dark-900 border border-white/10 text-gray-300 rounded-lg p-3 focus:ring-1 focus:ring-accent-600 outline-none"
            >
              {Object.values(SpriteType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Background Preference */}
        <div>
           <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              Background Preference
            </label>
            <div className="flex gap-3">
               {[
                 { label: 'Dark', value: 'Black' },
                 { label: 'Light', value: 'White' },
                 { label: 'Green', value: '#00FF00' },
                 { label: 'Blue', value: '#0000FF' },
               ].map((bg) => (
                 <button
                   key={bg.value}
                   type="button"
                   onClick={() => setBgColor(bg.value)}
                   className={`flex-1 py-2 text-xs rounded-lg border transition-all ${bgColor === bg.value ? 'bg-accent-600/20 border-accent-600 text-accent-400' : 'bg-dark-900 border-white/10 text-gray-400 hover:bg-white/5'}`}
                 >
                   {bg.label}
                 </button>
               ))}
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className={`
            w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase shadow-lg
            flex items-center justify-center gap-2 transition-all
            ${isLoading 
              ? 'bg-dark-900 text-gray-500 cursor-not-allowed border border-white/5' 
              : 'bg-gradient-to-r from-accent-600 to-indigo-600 hover:from-accent-500 hover:to-indigo-500 text-white shadow-accent-600/20 hover:shadow-accent-600/40 transform hover:-translate-y-0.5'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {referenceSprite ? 'Animating...' : 'Forging Sprite...'}
            </>
          ) : (
            <>
              {referenceSprite ? 'Generate Animation/Var' : 'Generate Sprite'}
              <Wand2 className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const SpriteDisplay = ({ 
  sprite, 
  isLoading,
  onUseAsReference
}: { 
  sprite: GeneratedSprite | null;
  isLoading: boolean;
  onUseAsReference: (sprite: GeneratedSprite) => void;
}) => {
  if (isLoading) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-dark-800 rounded-2xl border border-white/10 p-8 text-center animate-pulse">
        <div className="w-24 h-24 rounded-full bg-accent-600/20 flex items-center justify-center mb-6">
          <Loader2 className="w-10 h-10 text-accent-500 animate-spin" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">AI is Working</h3>
        <p className="text-gray-400 max-w-sm">
          Analyzing pixels and generating your asset. This usually takes about 5-10 seconds.
        </p>
      </div>
    );
  }

  if (!sprite) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-dark-800 rounded-2xl border border-dashed border-white/10 p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-dark-900 flex items-center justify-center mb-4 rotate-3 transform transition-transform group-hover:rotate-6">
          <ImageIcon className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-300">Ready to Forge</h3>
        <p className="text-gray-500 text-sm mt-2 max-w-xs">
          Fill out the form on the left to generate your first unique game asset.
        </p>
      </div>
    );
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = sprite.imageUrl;
    link.download = `pixelforge-${sprite.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-dark-800 rounded-2xl border border-white/10 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-white/10 flex flex-wrap gap-2 justify-between items-center bg-dark-900/50">
        <div className="min-w-0 flex-1 mr-2">
          <h3 className="font-semibold text-white text-sm truncate">{sprite.prompt}</h3>
          <p className="text-xs text-gray-500">{sprite.style} • {sprite.type}</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onUseAsReference(sprite)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-bold rounded-lg transition-colors border border-indigo-500/20"
            title="Create animations or variations of this character"
          >
            <Film className="w-4 h-4" />
            <span className="hidden sm:inline">Animate / Modify</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 bg-accent-600 hover:bg-accent-500 text-white text-xs font-bold rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-dark-900 p-8 flex items-center justify-center group overflow-hidden">
        {/* Checkerboard background for transparency simulation */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(45deg, #303030 25%, transparent 25%), linear-gradient(-45deg, #303030 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #303030 75%), linear-gradient(-45deg, transparent 75%, #303030 75%)',
               backgroundSize: '20px 20px',
               backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
             }} 
        />
        
        <img 
          src={sprite.imageUrl} 
          alt={sprite.prompt}
          className={`
            max-w-full max-h-[500px] shadow-2xl rounded-sm
            ${sprite.style === ArtStyle.PIXEL_ART ? 'rendering-pixelated' : ''}
            transition-transform duration-500 transform group-hover:scale-105
          `}
          style={{ imageRendering: sprite.style === ArtStyle.PIXEL_ART ? 'pixelated' : 'auto' }}
        />
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [history, setHistory] = useState<GeneratedSprite[]>([]);
  const [activeSprite, setActiveSprite] = useState<GeneratedSprite | null>(null);
  const [referenceSprite, setReferenceSprite] = useState<GeneratedSprite | null>(null); // New state for reference
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('pixelForgeHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        if (parsed.length > 0) {
          setActiveSprite(parsed[0]);
        }
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem('pixelForgeHistory', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async (config: GenerationConfig) => {
    setIsLoading(true);
    setError(null);
    try {
      const base64Image = await generateSprite(config);
      
      const newSprite: GeneratedSprite = {
        id: Date.now().toString(),
        imageUrl: base64Image,
        prompt: config.prompt,
        style: config.style,
        type: config.type,
        timestamp: Date.now()
      };

      setHistory(prev => [newSprite, ...prev]);
      setActiveSprite(newSprite);
      
      // Optional: Clear reference after successful generation? 
      // User might want to generate multiple animations from same ref, so keep it for now.
    } catch (err: any) {
      setError(err.message || "Failed to generate sprite. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    if (activeSprite?.id === id) {
      setActiveSprite(newHistory[0] || null);
    }
    // Also clear reference if we deleted the reference sprite
    if (referenceSprite?.id === id) {
      setReferenceSprite(null);
    }
  };

  const handleUseAsReference = (sprite: GeneratedSprite) => {
    setReferenceSprite(sprite);
    // Scroll to top on mobile to show the form has changed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-200 font-sans flex flex-col">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          history={history} 
          onSelect={setActiveSprite} 
          onDelete={handleDelete}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            
            {/* Left Column: Form */}
            <div className="lg:col-span-4 order-2 lg:order-1">
              <GeneratorForm 
                onSubmit={handleGenerate} 
                isLoading={isLoading} 
                referenceSprite={referenceSprite}
                onClearReference={() => setReferenceSprite(null)}
              />
              
              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {/* Tips Section */}
              <div className="mt-6 p-5 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl border border-white/5">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Pro Tips</h4>
                <ul className="text-xs text-gray-500 space-y-2 list-disc list-inside">
                   <li>Use <strong>"Sheet"</strong> type for animation frames.</li>
                   <li>Use <strong>"Animate / Modify"</strong> to keep the same character.</li>
                   <li>Specify colors like "Red armor, gold trim".</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Display */}
            <div className="lg:col-span-8 order-1 lg:order-2 h-[500px] lg:h-auto min-h-[500px]">
              <SpriteDisplay 
                sprite={activeSprite} 
                isLoading={isLoading} 
                onUseAsReference={handleUseAsReference}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}