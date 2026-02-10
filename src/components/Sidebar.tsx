import React from 'react';
import { SupabaseStatus } from './SupabaseStatus';

interface SidebarProps {
  activeView: string;
  setView: (view: any) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setView, theme, toggleTheme }) => {
  // 1. PRIME DIRECTIVE: The critical mission-focused tabs
  const coreItems = [
    { id: 'dashboard', label: 'Command Center', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'todos', label: 'Mission Control', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'discoveries', label: 'Discoveries', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { id: 'ideas', label: 'Idea Inbox', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  ];

  // 2. SYSTEM UTILITIES: Secondary tools
  const systemItems = [
    { id: 'daily', label: 'Daily Logs', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'contacts', label: 'Network Node', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'insights', label: 'Insights', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <div className="w-[18rem] glass-panel border-r border-white/5 flex flex-col hidden md:flex shrink-0">

      {/* Header */}
      <div className="p-8 pb-6">
        <div className="flex items-center justify-between text-sky-500/90">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
            <h1 className="text-xl font-black tracking-tight font-heading text-slate-800 dark:text-slate-100">AJ OS <span className="text-sky-500">26</span></h1>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 ring-1 ring-white/10"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.636 7.636l.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar pt-2">

        {/* PRIME DIRECTIVE - The Focus Zone */}
        <div className="space-y-1.5">
          <p className="px-4 text-[10px] text-slate-400 font-extrabold tracking-[0.2em] uppercase mb-3 animate-slide-up stagger-1">Prime Directive</p>
          {coreItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={{ animationDelay: `${(index + 2) * 50}ms` }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-300 text-[15px] group relative animate-slide-up ${activeView === item.id
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/20 translate-x-1'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'
                }`}
            >
              {activeView === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sky-500 rounded-r-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
              )}
              <svg
                className={`h-5 w-5 transition-transform duration-300 ${activeView === item.id ? 'text-sky-400 scale-110' : 'text-slate-400 group-hover:text-slate-600'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={activeView === item.id ? 2.5 : 2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className={`font-bold tracking-tight ${activeView === item.id ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* SYSTEM UTILITIES - Secondary Zone */}
        <div className="space-y-0.5">
          <p className="px-4 text-[9px] text-slate-300 font-bold tracking-[0.2em] uppercase mb-2 mt-4 opacity-70 animate-slide-up stagger-5">System Utilities</p>
          {systemItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={{ animationDelay: `${(index + 6) * 50}ms` }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm group animate-slide-up ${activeView === item.id
                ? 'bg-white text-slate-900 font-bold shadow-sm ring-1 ring-slate-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-white/40'
                }`}
            >
              <svg
                className={`h-4 w-4 transition-colors ${activeView === item.id ? 'text-sky-500' : 'text-slate-300 group-hover:text-slate-500'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="tracking-tight">{item.label}</span>
              {activeView === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              )}
            </button>
          ))}
        </div>

      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-white/5">
        <SupabaseStatus />
      </div>

    </div>
  );
};
