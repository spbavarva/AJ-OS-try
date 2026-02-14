import React, { useState, useEffect, useRef } from 'react';
import { Storage } from '../lib/store';
import { Idea, Category, Urgency } from '../lib/types';
import { useConfirm } from './ConfirmModal';
import { getLocalDate } from '../lib/date';

// Inline editable idea component
const EditableIdea: React.FC<{
  idea: Idea;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updated: Idea) => Promise<void>;
  onDelete: () => void;
  onToggleExecuted: () => void;
  onTogglePin: () => void;
  categories: { label: string; value: Category; icon?: string }[];
  saving: boolean;
}> = ({ idea, isEditing, onStartEdit, onCancelEdit, onSave, onDelete, onToggleExecuted, onTogglePin, categories, saving }) => {
  const [editThought, setEditThought] = useState(idea.thought);
  const [editCategory, setEditCategory] = useState(idea.category);
  const [editUrgency, setEditUrgency] = useState(idea.urgency);
  const [editPlatform, setEditPlatform] = useState(idea.platform);
  const [editExecuted, setEditExecuted] = useState(idea.executed || false);
  const thoughtRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditThought(idea.thought);
      setEditCategory(idea.category);
      setEditUrgency(idea.urgency);
      setEditPlatform(idea.platform);
      setEditExecuted(idea.executed || false);
      setTimeout(() => thoughtRef.current?.focus(), 50);
    }
  }, [isEditing, idea]);

  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancelEdit();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, editThought, editCategory, editUrgency, editPlatform, editExecuted]);

  const handleSave = async () => {
    if (!editThought || saving) return;

    const updatedIdea = {
      ...idea,
      thought: editThought,
      category: editCategory,
      urgency: editUrgency,
      platform: editCategory === 'Content' ? editPlatform : undefined,
      executed: editExecuted,
    };
    await onSave(updatedIdea);
  };

  if (isEditing) {
    return (
      <div className="glass-card p-5 md:p-6 rounded-2xl border-2 border-purple-500/50 shadow-lg shadow-purple-500/20 animate-pulse-border">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Editing Idea</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancelEdit}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 hover:border-zinc-300 transition-all shadow-sm hover:shadow"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
                <span className="text-[8px] text-zinc-400 font-normal ml-0.5">ESC</span>
              </button>
              <button
                onClick={handleSave}
                disabled={!editThought || saving}
                className="group flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-purple-500 text-white hover:bg-purple-600 border border-purple-600 hover:border-purple-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                <span className="text-[8px] text-purple-100 font-normal ml-0.5">⌘↵</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Idea / Thought</label>
              <textarea
                ref={thoughtRef}
                className="w-full bg-black/20 border border-purple-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[100px] resize-y font-medium text-main placeholder-zinc-600"
                value={editThought}
                onChange={e => setEditThought(e.target.value)}
                placeholder="What's the idea?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setEditCategory(cat.value)}
                      className={`py-2 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${editCategory === cat.value
                        ? cat.value === 'Content'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10'
                        }`}
                    >
                      {cat.icon && <span className="mr-1">{cat.icon}</span>}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Urgency</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map(urg => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => setEditUrgency(urg as Urgency)}
                      className={`py-2 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border flex-1 ${editUrgency === urg
                        ? (urg === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                          urg === 'Medium' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30')
                        : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10'
                        }`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {editCategory === 'Content' && (
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-purple-400 uppercase mono tracking-[0.2em] px-1">Platform</label>
                <div className="flex gap-2">
                  {[
                    { label: '𝕏 (Twitter)', value: 'X' as const },
                    { label: 'LinkedIn', value: 'LinkedIn' as const },
                    { label: 'YouTube', value: 'YouTube' as const }
                  ].map(platform => (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => setEditPlatform(platform.value)}
                      className={`py-2 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${editPlatform === platform.value
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10'
                        }`}
                    >
                      {platform.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[9px] font-black text-emerald-600 uppercase mono tracking-[0.2em] px-1">Status</label>
              <button
                type="button"
                onClick={() => setEditExecuted(!editExecuted)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border w-full ${editExecuted
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-white/5 text-zinc-500 border-white/10 hover:bg-white/10'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={editExecuted ? 3 : 2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{editExecuted ? 'Executed' : 'Mark as Executed'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-card group p-5 md:p-6 rounded-2xl flex flex-col justify-between hover:border-sky-500/40 transition-all duration-300 relative overflow-hidden cursor-pointer"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onStartEdit();
      }}
    >
      {idea.urgency === 'High' && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-[30px] rounded-full translate-x-8 -translate-y-8 group-hover:bg-rose-500/10 transition-colors"></div>
      )}
      {idea.category === 'Content' && (
        <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/5 blur-[30px] rounded-full -translate-x-8 -translate-y-8 group-hover:bg-purple-500/10 transition-colors"></div>
      )}

      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg mono uppercase tracking-widest border ${idea.urgency === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
              idea.urgency === 'Medium' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
              {idea.urgency}
            </span>
            <span className={`text-[9px] mono font-black uppercase tracking-[0.1em] ${idea.category === 'Content' ? 'text-purple-400' : 'text-zinc-500'}`}>
              {categories.find(c => c.value === idea.category)?.icon} {categories.find(c => c.value === idea.category)?.label}
            </span>
            {idea.platform && (
              <span className="text-[8px] font-black px-2 py-0.5 rounded-md mono uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {idea.platform === 'X' ? '𝕏' : idea.platform}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
              className={`p-2 rounded-lg transition-all ${idea.pinned
                ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-zinc-600 hover:text-amber-500 hover:bg-amber-500/10'
                }`}
              title={idea.pinned ? 'Unpin' : 'Pin'}
            >
              <svg className="w-3.5 h-3.5" fill={idea.pinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button onClick={onStartEdit} className="p-2 text-zinc-600 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
        {/* Pinned Badge */}
        {idea.pinned && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-sm">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-[11px] font-black text-amber-500 mono uppercase tracking-widest leading-none">PINNED</span>
            </div>
          </div>
        )}
        <p className="text-sm text-slate-200 font-medium leading-relaxed tracking-tight">{idea.thought}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between relative z-10" onClick={(e) => e.stopPropagation()}>
        <span className="text-[9px] text-zinc-600 mono font-black uppercase tracking-widest">{idea.traceDate || idea.date}</span>
        <button
          onClick={onToggleExecuted}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[9px] font-black mono uppercase tracking-widest transition-all ${idea.executed
            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
            : 'bg-white/5 text-zinc-500 border border-white/10 hover:bg-white/10'
            }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={idea.executed ? 3 : 2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Executed</span>
        </button>
      </div>
    </div>
  );
};

export const IdeaInbox: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [formData, setFormData] = useState({
    thought: '',
    category: 'Content' as Category,
    urgency: 'Medium' as Urgency,
    platform: undefined as 'X' | 'LinkedIn' | 'YouTube' | undefined,
    executed: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showConfirm } = useConfirm();

  useEffect(() => {
    const loadIdeas = async () => {
      const fetchedIdeas = await Storage.fetchIdeas();
      setIdeas(fetchedIdeas);
    };
    loadIdeas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.thought) return;

    setSaving(true);
    try {
      const now = getLocalDate();
      const newIdea: Idea = {
        id: crypto.randomUUID(),
        date: now,
        traceDate: now,
        status: 'Inbox',
        thought: formData.thought,
        category: formData.category,
        urgency: formData.urgency,
        platform: formData.category === 'Content' ? formData.platform : undefined,
        executed: false,
      };
      await Storage.saveIdea(newIdea);
      const refreshedIdeas = await Storage.fetchIdeas();
      setIdeas(refreshedIdeas);
      setFormData({ thought: '', category: 'Content', urgency: 'Medium', platform: undefined, executed: false });
      setShowAddForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleInlineSave = async (updatedIdea: Idea) => {
    setSaving(true);
    try {
      await Storage.updateIdea(updatedIdea);
      const refreshedIdeas = await Storage.fetchIdeas();
      setIdeas(refreshedIdeas);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const deleteIdea = async (id: string) => {
    const confirmed = await showConfirm('Are you sure you want to delete this idea? This action cannot be undone.');
    if (confirmed) {
      await Storage.deleteIdea(id);
      setIdeas(ideas.filter(i => i.id !== id));
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  const toggleExecuted = async (idea: Idea) => {
    const updated = { ...idea, executed: !idea.executed };
    await Storage.updateIdea(updated);
    const refreshedIdeas = await Storage.fetchIdeas();
    setIdeas(refreshedIdeas);
  };

  const togglePin = async (idea: Idea) => {
    const updated = { ...idea, pinned: !idea.pinned };
    await Storage.updateIdea(updated);
    const refreshedIdeas = await Storage.fetchIdeas();
    setIdeas(refreshedIdeas);
  };

  const categories: { label: string; value: Category; icon?: string }[] = [
    { label: 'Content', value: 'Content', icon: '' },
    { label: 'Blog', value: 'Blog' },
    { label: 'Deep Work', value: 'Deep_Work' },
    { label: 'Life', value: 'Life' },
    { label: 'Growth', value: 'Growth' },
    { label: 'Random', value: 'Random' },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header with Add Button */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-[1px] w-10 bg-gradient-to-r from-sky-500 to-transparent"></div>
            <span className="text-[10px] font-black mono uppercase tracking-[0.4em] text-zinc-500">Operation: Idea Incubation</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-main font-heading uppercase">QUICK INBOX</h2>
          <p className="text-zinc-500 mt-4 max-w-lg leading-relaxed font-medium hidden md:block">
            Capture signals before they decay. Content ideas for X & LinkedIn. Thoughts that need refinement.
          </p>
        </div>

        {/* Add Idea Button */}
        <button
          onClick={() => {
            if (showAddForm) {
              setShowAddForm(false);
              setFormData({ thought: '', category: 'Content', urgency: 'Medium', platform: undefined, executed: false });
            } else {
              setShowAddForm(true);
              setEditingId(null);
            }
          }}
          className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-black text-sm transition-all ${showAddForm
            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            : 'bg-white text-black hover:bg-slate-200 shadow-2xl'
            }`}
        >
          <svg
            className={`w-5 h-5 transition-transform ${showAddForm ? 'rotate-45' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="uppercase tracking-widest text-[10px]">{showAddForm ? 'Cancel' : 'New Idea'}</span>
        </button>
      </header>

      {/* Stats */}
      <div className="flex items-center space-x-4">
        <div className="glass-card px-6 py-3 rounded-2xl border border-purple-500/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-[10px] font-black mono uppercase tracking-widest text-purple-400">{ideas.filter(i => i.category === 'Content').length} Content</span>
          </div>
        </div>
        <div className="glass-card px-6 py-3 rounded-2xl border border-sky-500/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-sky-500"></div>
            <span className="text-[10px] font-black mono uppercase tracking-widest text-sky-400">{ideas.length} Total</span>
          </div>
        </div>
      </div>

      {/* Collapsible Add Form */}
      <div className={`overflow-hidden transition-all duration-500 ${showAddForm ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative glass-card p-6 md:p-8 rounded-[2rem] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-main uppercase tracking-widest">New Idea</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ thought: '', category: 'Content', urgency: 'Medium', platform: undefined, executed: false });
                }}
                className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-main transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-zinc-500 uppercase mono tracking-[0.3em] px-1">Raw Intelligence</label>
              <textarea
                className="w-full bg-black/5 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/10 transition-all h-24 resize-none font-medium text-main leading-relaxed"
                placeholder="Record the signal..."
                value={formData.thought}
                onChange={e => setFormData({ ...formData, thought: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-zinc-500 uppercase mono tracking-[0.3em] px-1">Classification</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`py-2.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${formData.category === cat.value
                        ? cat.value === 'Content'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10'
                        }`}
                    >
                      {cat.icon && <span className="mr-1">{cat.icon}</span>}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-zinc-500 uppercase mono tracking-[0.3em] px-1">Urgency</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map(urg => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgency: urg as Urgency })}
                      className={`py-2.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex-1 ${formData.urgency === urg
                        ? (urg === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                          urg === 'Medium' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30')
                        : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10'
                        }`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {formData.category === 'Content' && (
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-purple-400 uppercase mono tracking-[0.3em] px-1">Platform Target</label>
                <div className="flex gap-2">
                  {[
                    { label: '𝕏 (Twitter)', value: 'X' as const },
                    { label: 'LinkedIn', value: 'LinkedIn' as const },
                    { label: 'YouTube', value: 'YouTube' as const }
                  ].map(platform => (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, platform: platform.value })}
                      className={`py-2.5 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${formData.platform === platform.value
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10'
                        }`}
                    >
                      {platform.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end items-center space-x-4 pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={!formData.thought || saving}
                className="bg-white text-black text-[10px] font-black px-10 py-4 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-20 uppercase tracking-[0.3em] shadow-xl active:scale-95"
              >
                {saving ? 'Transmitting...' : 'Commit'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Ideas List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-[1px] bg-slate-800"></div>
            <h3 className="text-xs font-black text-zinc-500 uppercase mono tracking-[0.4em]">Signal History</h3>
          </div>
          <p className="text-[10px] text-zinc-600 mono uppercase font-black tracking-widest">{ideas.length} Ideas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
          {ideas.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center py-24 text-center opacity-60">
              <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-main uppercase tracking-widest mb-1">Frequency Silent</h4>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">No signals detected in the inbox.<br />Capture new intelligence to begin processing.</p>
            </div>
          )}
          {ideas
            .sort((a, b) => {
              // First, separate by execution status (unexecuted first)
              const aExecuted = a.executed || false;
              const bExecuted = b.executed || false;
              if (aExecuted !== bExecuted) return aExecuted ? 1 : -1;

              // Then by pinned status (pinned first)
              const aPinned = a.pinned || false;
              const bPinned = b.pinned || false;
              if (aPinned !== bPinned) return aPinned ? -1 : 1;

              // Finally sort by date (newest first)
              return (b.traceDate || b.date).localeCompare(a.traceDate || a.date);
            })
            .map((idea, index) => (
              <div key={idea.id} style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }} className="animate-slide-up">
                <EditableIdea
                  idea={idea}
                  isEditing={editingId === idea.id}
                  onStartEdit={() => {
                    setEditingId(idea.id);
                    setShowAddForm(false);
                  }}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={handleInlineSave}
                  onDelete={() => deleteIdea(idea.id)}
                  onToggleExecuted={() => toggleExecuted(idea)}
                  onTogglePin={() => togglePin(idea)}
                  categories={categories}
                  saving={saving}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
