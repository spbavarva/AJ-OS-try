import React, { useState } from 'react';
import { SupabaseStatus } from './SupabaseStatus';

interface MobileNavProps {
    activeView: string;
    setView: (view: any) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeView, setView, theme, toggleTheme }) => {
    const [showMore, setShowMore] = useState(false);

    // Main navigation items (shown in bottom bar)
    const mainItems = [
        { id: 'dashboard', label: 'Command', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'todos', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        { id: 'ideas', label: 'Ideas', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
        { id: 'daily', label: 'Daily', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    ];

    // Secondary items (shown in expandable menu)
    const moreItems = [
        { id: 'discoveries', label: 'Discoveries', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
        { id: 'contacts', label: 'Network Node', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { id: 'insights', label: 'Insights', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    ];

    const isActiveInMore = moreItems.some(item => item.id === activeView);

    return (
        <>
            {/* Expandable Menu Overlay */}
            {showMore && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setShowMore(false)}
                />
            )}

            {/* Expandable Menu */}
            <div
                className={`fixed left-0 right-0 bottom-[72px] z-50 md:hidden transition-all duration-300 transform ${showMore ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
                    }`}
            >
                <div className="mx-4 mb-2 glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <SupabaseStatus />
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            {theme === 'light' ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.636 7.636l.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-2">
                        {moreItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setView(item.id);
                                    setShowMore(false);
                                }}
                                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${activeView === item.id
                                    ? 'bg-sky-500/20 text-sky-400'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                </svg>
                                <span className="text-sm font-semibold truncate">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 md:hidden z-50 safe-area-bottom">
                <div className="flex items-center justify-around px-2 py-2">
                    {mainItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setView(item.id);
                                setShowMore(false);
                            }}
                            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all min-w-[60px] ${activeView === item.id
                                ? 'text-sky-400'
                                : 'text-zinc-500'
                                }`}
                        >
                            <div className={`relative ${activeView === item.id ? 'scale-110' : ''} transition-transform`}>
                                {activeView === item.id && (
                                    <div className="absolute -inset-2 bg-sky-500/20 rounded-xl blur-md" />
                                )}
                                <svg className="w-6 h-6 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === item.id ? 2 : 1.5} d={item.icon} />
                                </svg>
                            </div>
                            <span className={`text-[10px] font-bold mt-1 ${activeView === item.id ? 'text-sky-400' : 'text-zinc-500'}`}>
                                {item.label}
                            </span>
                        </button>
                    ))}

                    {/* More Button */}
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all min-w-[60px] ${showMore || isActiveInMore ? 'text-sky-400' : 'text-zinc-500'
                            }`}
                    >
                        <div className={`relative ${showMore || isActiveInMore ? 'scale-110' : ''} transition-transform`}>
                            {(showMore || isActiveInMore) && (
                                <div className="absolute -inset-2 bg-sky-500/20 rounded-xl blur-md" />
                            )}
                            <svg className="w-6 h-6 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={showMore || isActiveInMore ? 2 : 1.5}
                                    d={showMore
                                        ? "M6 18L18 6M6 6l12 12"
                                        : "M4 6h16M4 12h16M4 18h16"
                                    }
                                />
                            </svg>
                        </div>
                        <span className={`text-[10px] font-bold mt-1 ${showMore || isActiveInMore ? 'text-sky-400' : 'text-zinc-500'}`}>
                            {showMore ? 'Close' : 'More'}
                        </span>
                    </button>
                </div>
            </nav>
        </>
    );
};
