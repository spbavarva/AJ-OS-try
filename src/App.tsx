
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './components/Dashboard';
import { DailyCapture } from './components/DailyCapture';
import { IdeaInbox } from './components/IdeaInbox';
import { TodoList } from './components/TodoList';
import { CommandBar } from './components/CommandBar';
import { FocusReminder } from './components/FocusReminder';
import { ContactManager } from './components/ContactManager';
import { Discoveries } from './components/Discoveries';
import { Insights } from './components/Insights';
import { ConfirmProvider } from './components/ConfirmModal';

type View = 'dashboard' | 'daily' | 'ideas' | 'todos' | 'contacts' | 'discoveries' | 'insights';

// Route mapping: URL slug -> View ID
const ROUTE_TO_VIEW: Record<string, View> = {
  'commandcenter': 'dashboard',
  'missioncontrol': 'todos',
  'dailylogs': 'daily',
  'ideainbox': 'ideas',
  'discoveries': 'discoveries',
  'networknode': 'contacts',
  'insights': 'insights',
};

// Reverse mapping: View ID -> URL slug
const VIEW_TO_ROUTE: Record<View, string> = {
  'dashboard': 'commandcenter',
  'todos': 'missioncontrol',
  'daily': 'dailylogs',
  'ideas': 'ideainbox',
  'discoveries': 'discoveries',
  'contacts': 'networknode',
  'insights': 'insights',
};

// Parse hash URL to get view
const getViewFromHash = (): View => {
  const hash = window.location.hash.replace('#/', '').toLowerCase();
  return ROUTE_TO_VIEW[hash] || 'dashboard';
};

// Update URL hash without triggering hashchange
const updateHash = (view: View) => {
  const route = VIEW_TO_ROUTE[view];
  const newHash = `#/${route}`;
  if (window.location.hash !== newHash) {
    window.history.pushState(null, '', newHash);
  }
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(() => getViewFromHash());
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const mainRef = React.useRef<HTMLDivElement>(null);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Handle view change with URL sync
  const handleViewChange = useCallback((view: View) => {
    setActiveView(view);
    updateHash(view);
  }, []);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const view = getViewFromHash();
      setActiveView(view);
    };

    const handlePopState = () => {
      const view = getViewFromHash();
      setActiveView(view);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);

    // Set initial hash if not present
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/commandcenter');
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Reset scroll on view change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeView]);

  return (
    <ConfirmProvider>
      {/* 
        PREMIUM 10X BACKGROUND SYSTEM 
        Architecture: "Neuro-Grid Flux"
        Layers: Grain > Grid > Aurora > Vignette
      */}
      <div className={`fixed inset-0 z-0 pointer-events-none overflow-hidden touch-none select-none transition-colors duration-700 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-[#fdfbf7]'}`}>
        {/* Layer 1: The Paper Grain (Subtle Texture) */}
        <div className={`absolute inset-0 z-[1] opacity-[0.4] ${theme === 'dark' ? 'mix-blend-overlay' : 'mix-blend-multiply'}`} style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.08%22/%3E%3C/svg%3E")' }}></div>

        {/* Layer 2: The Architect's Grid (Barely Visible) */}
        <div className={`absolute inset-0 z-[0] ${theme === 'dark' ? 'opacity-[0.05]' : 'opacity-[0.03]'}`}
          style={{
            backgroundImage: `linear-gradient(${theme === 'dark' ? '#ffffff' : '#000000'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? '#ffffff' : '#000000'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}>
        </div>

        {/* Layer 3: Ambient Flux (Soft Light, No Stains) */}
        <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] animate-flux-slow ${theme === 'dark' ? 'bg-teal-500/10' : 'bg-teal-300/10'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] animate-flux-slow ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-orange-300/10'}`} style={{ animationDelay: '-5s' }}></div>
      </div>

      <div className={`flex h-screen bg-transparent transition-colors duration-400 relative z-10 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'} overflow-hidden`}>
        <Sidebar
          activeView={activeView}
          setView={handleViewChange}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <FocusReminder key={activeView} />

          <main
            ref={mainRef}
            className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth pb-24 md:pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)]"
          >
            <div className="max-w-5xl mx-auto pb-20">
              {activeView === 'dashboard' && <Dashboard setView={handleViewChange} />}
              {activeView === 'daily' && <DailyCapture />}
              {activeView === 'ideas' && <IdeaInbox />}
              {activeView === 'todos' && <TodoList />}
              {activeView === 'contacts' && <ContactManager />}
              {activeView === 'discoveries' && <Discoveries />}
              {activeView === 'insights' && <Insights />}
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileNav activeView={activeView} setView={handleViewChange} theme={theme} toggleTheme={toggleTheme} />
        </div>

        <CommandBar
          isOpen={isCommandBarOpen}
          onClose={() => setIsCommandBarOpen(false)}
          onAction={(action) => handleViewChange(action as View)}
        />
      </div>
    </ConfirmProvider>
  );
};

export default App;
