import React, { useState, useEffect, useRef } from 'react';
import { Storage } from '../lib/store';
import { Discovery, DiscoveryImpact } from '../lib/types';
import { getLocalDate } from '../lib/date';
import { useConfirm } from './ConfirmModal';

// Inline editable discovery component - Elegant List Row Version
const EditableDiscoveryListRow: React.FC<{
  discovery: Discovery;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updated: Discovery) => Promise<void>;
  onDelete: () => void;
  onTogglePin: () => void;
  saving: boolean;
}> = ({ discovery, isEditing, onStartEdit, onCancelEdit, onSave, onDelete, onTogglePin, saving }) => {
  const [editTitle, setEditTitle] = useState(discovery.title);
  const [editUrl, setEditUrl] = useState(discovery.url);
  const [editDescription, setEditDescription] = useState(discovery.description);
  const [editCategory, setEditCategory] = useState(discovery.category);
  const [editImpact, setEditImpact] = useState(discovery.impact);
  const [isExpanded, setIsExpanded] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditTitle(discovery.title);
      setEditUrl(discovery.url);
      setEditDescription(discovery.description);
      setEditCategory(discovery.category);
      setEditImpact(discovery.impact);
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [isEditing, discovery]);

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
  }, [isEditing, editTitle, editUrl, editDescription, editCategory, editImpact]);

  const handleSave = async () => {
    if (!editTitle || saving) return;

    const updatedDiscovery = {
      ...discovery,
      title: editTitle,
      url: editUrl,
      description: editDescription,
      category: editCategory,
      impact: editImpact,
    };
    await onSave(updatedDiscovery);
  };

  if (isEditing) {
    return (
      <div className="glass-card p-5 md:p-6 rounded-2xl border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20 animate-pulse-border my-3">
        <div className="grid grid-cols-12 gap-5 items-start">
          <div className="col-span-12 md:col-span-5 space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-indigo-600/70 uppercase tracking-wider mb-1.5 ml-0.5">Title</label>
              <input
                ref={titleRef}
                className="w-full bg-white/90 border border-indigo-200/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all font-semibold text-slate-800 placeholder-slate-400 shadow-sm"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="Discovery title..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-indigo-600/70 uppercase tracking-wider mb-1.5 ml-0.5">URL</label>
              <input
                className="w-full bg-white/90 border border-indigo-200/50 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all text-slate-600 placeholder-slate-400 shadow-sm"
                value={editUrl}
                onChange={e => setEditUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-4">
            <label className="block text-[10px] font-bold text-indigo-600/70 uppercase tracking-wider mb-1.5 ml-0.5">Description</label>
            <textarea
              className="w-full bg-white/90 border border-indigo-200/50 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all min-h-[110px] resize-y font-medium text-slate-700 placeholder-slate-400 shadow-sm leading-relaxed"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              placeholder="Add context and details..."
            />
          </div>
          <div className="col-span-12 md:col-span-3 space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-indigo-600/70 uppercase tracking-wider mb-1.5 ml-0.5">Category</label>
              <select
                className="w-full bg-white/90 border border-indigo-200/50 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all font-bold uppercase tracking-wide text-slate-700 shadow-sm"
                value={editCategory}
                onChange={e => setEditCategory(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Website">Website</option>
                <option value="Product">Product</option>
                <option value="Research">Research</option>
                <option value="Tool">Tool</option>
                <option value="Article">Article</option>
                <option value="Job">Job</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-indigo-600/70 uppercase tracking-wider mb-1.5 ml-0.5">Impact</label>
              <select
                className="w-full bg-white/90 border border-indigo-200/50 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all font-bold uppercase tracking-wide text-slate-700 shadow-sm"
                value={editImpact}
                onChange={e => setEditImpact(e.target.value as DiscoveryImpact)}
              >
                <option value="Linear">Linear</option>
                <option value="Exponential">Exponential</option>
                <option value="Disruptive">Disruptive</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onCancelEdit}
                className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const impactColors = {
    Disruptive: 'from-rose-500 to-pink-500',
    Exponential: 'from-sky-500 to-blue-500',
    Linear: 'from-slate-400 to-slate-500'
  };

  const impactTextColors = {
    Disruptive: 'text-rose-600',
    Exponential: 'text-sky-600',
    Linear: 'text-slate-600'
  };

  return (
    <div
      className={`group flex flex-col border-b border-slate-200/60 transition-all duration-300 cursor-pointer ${isExpanded
        ? 'bg-slate-50/80 shadow-sm'
        : 'hover:bg-slate-50/50'
        }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Main Row */}
      <div className="px-3 sm:px-5 py-4">
        {/* Mobile Layout */}
        <div className="flex md:hidden flex-col gap-3">
          {/* Signal Name & URL - Full Width on Mobile */}
          <div className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 transition-all duration-300 shadow-sm ${isExpanded ? 'scale-125 shadow-md' : ''
              } bg-gradient-to-br ${impactColors[discovery.impact]}`}></div>
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-semibold transition-colors leading-snug block ${isExpanded ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
                }`}>{discovery.title}</span>
              {discovery.url && (
                <a
                  href={discovery.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-slate-500 hover:text-indigo-600 transition-colors font-medium mt-0.5 block truncate"
                >
                  {new URL(discovery.url).hostname.replace('www.', '')}
                </a>
              )}
            </div>
            {/* Actions on Mobile - Right Side */}
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
                className={`p-2 rounded-lg transition-all ${discovery.pinned
                  ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                  }`}
                title={discovery.pinned ? 'Unpin' : 'Pin'}
              >
                <svg className="w-4 h-4" fill={discovery.pinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button
                onClick={onStartEdit}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Category & Impact Badges - Below on Mobile */}
          <div className="flex items-center gap-2 ml-5">
            <span className={`inline-flex text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wide transition-all ${isExpanded
              ? 'bg-indigo-100/80 text-indigo-700 shadow-sm'
              : discovery.category
                ? 'bg-slate-100/80 text-slate-600 group-hover:bg-slate-200/80'
                : 'bg-amber-100/80 text-amber-700 shadow-sm'
              }`}>
              {discovery.category ? discovery.category.toUpperCase() : 'UNCATEGORIZED'}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wide ${impactTextColors[discovery.impact]}`}>
              {discovery.impact}
            </span>
          </div>
        </div>

        {/* Desktop Layout - Grid */}
        <div className="hidden md:grid grid-cols-12 gap-4 items-center">
          {/* 1. Title & URL (4 cols) */}
          <div className="col-span-4 flex items-center gap-3 overflow-hidden">
            <div className={`w-2 h-2 rounded-full shrink-0 transition-all duration-300 shadow-sm ${isExpanded ? 'scale-125 shadow-md' : ''
              } bg-gradient-to-br ${impactColors[discovery.impact]}`}></div>
            <div className="flex flex-col truncate">
              <span className={`text-sm font-semibold truncate transition-colors leading-snug ${isExpanded ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
                }`}>{discovery.title}</span>
              {discovery.url && (
                <a
                  href={discovery.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-slate-500 truncate hover:text-indigo-600 transition-colors font-medium mt-0.5"
                >
                  {new URL(discovery.url).hostname.replace('www.', '')}
                </a>
              )}
            </div>
          </div>

          {/* 2. Category (2 cols) */}
          <div className="col-span-2">
            <span className={`inline-flex text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wide transition-all ${isExpanded
              ? 'bg-indigo-100/80 text-indigo-700 shadow-sm'
              : discovery.category
                ? 'bg-slate-100/80 text-slate-600 group-hover:bg-slate-200/80'
                : 'bg-amber-100/80 text-amber-700 shadow-sm'
              }`}>
              {discovery.category ? discovery.category.toUpperCase() : 'UNCATEGORIZED'}
            </span>
          </div>

          {/* 3. Impact (2 cols) */}
          <div className="col-span-2">
            <span className={`text-[10px] font-bold uppercase tracking-wide ${impactTextColors[discovery.impact]}`}>
              {discovery.impact}
            </span>
          </div>

          {/* 4. Date (2 cols) */}
          <div className="col-span-2 text-[11px] font-medium text-slate-500">
            {discovery.dateAdded}
          </div>

          {/* 5. Actions (2 cols) */}
          <div className="col-span-2 flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
              className={`p-2 rounded-lg transition-all ${discovery.pinned
                ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                }`}
              title={discovery.pinned ? 'Unpin' : 'Pin'}
            >
              <svg className="w-4 h-4" fill={discovery.pinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button
              onClick={onStartEdit}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Description Panel */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 md:px-16 pb-5 pt-0 text-sm text-slate-700 leading-relaxed">
          {/* Pinned Badge */}
          {discovery.pinned && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-sm">
                <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span className="text-[11px] font-black text-amber-500 mono uppercase tracking-widest leading-none">PINNED</span>
              </div>
            </div>
          )}
          <div className="p-5 bg-gradient-to-br from-white/90 to-slate-50/50 rounded-2xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
            {discovery.description || <span className="text-slate-400 italic">No description provided.</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Discoveries: React.FC = () => {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
    impact: 'Linear' as DiscoveryImpact,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showConfirm } = useConfirm();

  useEffect(() => {
    setDiscoveries(Storage.getDiscoveries());
    Storage.fetchDiscoveries().then(setDiscoveries);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setSaving(true);
    try {
      const now = getLocalDate();
      const newDiscovery: Discovery = {
        id: crypto.randomUUID(),
        dateAdded: now,
        traceDate: now,
        ...formData,
      };

      // Save to Supabase
      await Storage.saveDiscovery(newDiscovery);

      // Fetch fresh data from Supabase to ensure consistency
      const updatedDiscoveries = await Storage.fetchDiscoveries();
      setDiscoveries(updatedDiscoveries);

      // Reset form
      setFormData({ title: '', url: '', description: '', category: '', impact: 'Linear' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to save discovery:', error);
      alert('Failed to save discovery. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInlineSave = async (updatedDiscovery: Discovery) => {
    setSaving(true);
    try {
      await Storage.updateDiscovery(updatedDiscovery);
      setDiscoveries(discoveries.map(d => d.id === updatedDiscovery.id ? updatedDiscovery : d));
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const deleteDiscovery = async (id: string) => {
    const confirmed = await showConfirm('Are you sure you want to permanently remove this discovery?');
    if (confirmed) {
      await Storage.deleteDiscovery(id);
      setDiscoveries(discoveries.filter(d => d.id !== id));
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  const togglePin = async (discovery: Discovery) => {
    const updated = { ...discovery, pinned: !discovery.pinned };
    await Storage.updateDiscovery(updated);
    setDiscoveries(discoveries.map(d => d.id === discovery.id ? updated : d));
  };

  return (
    <div className="space-y-8 animate-slide-up h-full flex flex-col">
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-[2px] bg-gradient-to-r from-indigo-500 to-transparent rounded-full"></div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">Signal Database</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-main font-heading uppercase">DISCOVERY LAB</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center space-x-2.5 px-6 py-4 rounded-2xl font-black text-sm transition-all shadow-xl ${showAddForm
            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            : 'bg-white text-black hover:bg-slate-200 shadow-2xl'
            }`}
        >
          <svg className={`w-5 h-5 transition-transform duration-300 ${showAddForm ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="uppercase tracking-widest text-[10px]">{showAddForm ? 'Close' : 'New Signal'}</span>
        </button>
      </div>

      {/* Add Form (Collapsible) */}
      <div className={`shrink-0 overflow-hidden transition-all duration-500 ease-out ${showAddForm ? 'max-h-[800px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-100 transition duration-1000"></div>
          <form onSubmit={handleSubmit} className="relative glass-card p-6 md:p-8 rounded-[2rem] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-indigo-600/70 uppercase tracking-wider mb-2 ml-0.5">Subject</label>
                <input
                  className="w-full bg-white/90 border border-indigo-200/50 rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all placeholder-slate-400 shadow-sm"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What did you discover?"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-indigo-600/70 uppercase tracking-wider mb-2 ml-0.5">Link</label>
                <input
                  className="w-full bg-white/90 border border-indigo-200/50 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all placeholder-slate-400 shadow-sm"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://"
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-indigo-600/70 uppercase tracking-wider mb-2 ml-0.5">Description</label>
              <textarea
                className="w-full bg-white/90 border border-indigo-200/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all placeholder-slate-400 shadow-sm min-h-[80px] resize-y leading-relaxed"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add context, insights, or why this matters..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-[11px] font-bold text-indigo-600/70 uppercase tracking-wider mb-2 ml-0.5">Category</label>
                <select
                  className="w-full bg-white/90 border border-indigo-200/50 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all shadow-sm"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select category...</option>
                  <option value="Website">Website</option>
                  <option value="Product">Product</option>
                  <option value="Research">Research</option>
                  <option value="Tool">Tool</option>
                  <option value="Article">Article</option>
                  <option value="Job">Job</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-indigo-600/70 uppercase tracking-wider mb-2 ml-0.5">Impact Level</label>
                <div className="flex bg-white/90 rounded-xl p-1.5 border border-indigo-200/50 shadow-sm gap-1">
                  {['Linear', 'Exponential', 'Disruptive'].map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, impact: i as any })}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${formData.impact === i
                        ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30'
                        : 'bg-slate-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100'
                        }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-zinc-100">
              <button
                type="submit"
                disabled={!formData.title || saving}
                className="bg-white text-black text-[10px] font-black px-10 py-4 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed uppercase tracking-[0.3em] shadow-xl active:scale-95"
              >
                {saving ? 'Saving...' : 'Add to Database'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* List Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b-2 border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
        <div className="col-span-4">Signal</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-2">Impact</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Scrollable List Area */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pb-20">
        {discoveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl m-4 bg-slate-50/30">
            <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="font-semibold text-sm uppercase tracking-widest">Database Empty</p>
            <p className="text-xs mt-1">Add your first discovery to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/60">
            {discoveries
              .sort((a, b) => {
                // Pinned items always come first
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                // Then sort by date (newest first)
                return (b.traceDate || b.dateAdded).localeCompare(a.traceDate || a.dateAdded);
              })
              .map(d => (
                <EditableDiscoveryListRow
                  key={d.id}
                  discovery={d}
                  isEditing={editingId === d.id}
                  onStartEdit={() => setEditingId(d.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={handleInlineSave}
                  onDelete={() => deleteDiscovery(d.id)}
                  onTogglePin={() => togglePin(d)}
                  saving={saving}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discoveries;
