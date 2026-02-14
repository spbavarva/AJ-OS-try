import React, { useState, useEffect, useRef } from 'react';
import { SupabaseStatus } from './SupabaseStatus';
import { Storage } from '../lib/store';
import { DailyEntry } from '../lib/types';
import { useConfirm } from './ConfirmModal';
import { getLocalDate, parseLocalDate } from '../lib/date';

// Inline editable entry component with better UX
const EditableEntry: React.FC<{
  entry: DailyEntry;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updated: DailyEntry) => Promise<void>;
  onDelete: () => void;
  onTogglePin: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  formatDateLabel: (date: string) => string;
  saving: boolean;
}> = ({ entry, isEditing, onStartEdit, onCancelEdit, onSave, onDelete, onTogglePin, onMoveUp, onMoveDown, formatDateLabel, saving }) => {
  const [editWorkedOn, setEditWorkedOn] = useState(entry.workedOn);
  const [editShipped, setEditShipped] = useState(entry.shipped);
  const [editDate, setEditDate] = useState(entry.date);
  const workedOnRef = useRef<HTMLTextAreaElement>(null);

  // Reset form when entry changes or editing starts
  useEffect(() => {
    if (isEditing) {
      setEditWorkedOn(entry.workedOn);
      setEditShipped(entry.shipped);
      setEditDate(entry.date);
      // Focus after a short delay to ensure the textarea is rendered
      setTimeout(() => workedOnRef.current?.focus(), 50);
    }
  }, [isEditing, entry]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel
      if (e.key === 'Escape') {
        onCancelEdit();
      }
      // Cmd/Ctrl + Enter to save
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, editWorkedOn, editShipped, editDate]);

  const handleSave = async () => {
    if (!editWorkedOn || !editShipped || saving) return;

    const updatedEntry = {
      ...entry,
      workedOn: editWorkedOn,
      shipped: editShipped,
      date: editDate,
      traceDate: editDate,
    };
    await onSave(updatedEntry);
  };

  if (isEditing) {
    return (
      <div className="glass-card p-5 md:p-6 rounded-2xl border-2 border-sky-500/50 shadow-lg shadow-sky-500/20 animate-pulse-border">
        <div className="space-y-4">
          {/* Compact header with date and actions */}
          <div className="flex items-center justify-between pb-4 border-b border-sky-500/20">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Editing Mode</span>
              </div>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                max={getLocalDate()}
                className="px-3 py-1.5 rounded-lg text-[9px] font-black mono uppercase tracking-widest bg-sky-500/5 text-zinc-400 border border-sky-500/20 hover:border-sky-500/40 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
              />
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
                disabled={!editWorkedOn || !editShipped || saving}
                className="group flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-sky-500 text-white hover:bg-sky-600 border border-sky-600 hover:border-sky-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                <span className="text-[8px] text-sky-100 font-normal ml-0.5">⌘↵</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">
                The Work
              </label>
              <textarea
                ref={workedOnRef}
                className="w-full bg-black/20 border border-sky-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all min-h-[140px] resize-y font-medium text-main placeholder-zinc-600"
                value={editWorkedOn}
                onChange={e => setEditWorkedOn(e.target.value)}
                placeholder="What did you work on?"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">
                The Ship
              </label>
              <textarea
                className="w-full bg-black/20 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[140px] resize-y font-medium text-main placeholder-zinc-600"
                value={editShipped}
                onChange={e => setEditShipped(e.target.value)}
                placeholder="What did you ship?"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-card group p-5 md:p-6 rounded-2xl flex flex-col md:flex-row items-start justify-between hover:border-sky-500/30 transition-all duration-300 gap-4 cursor-pointer"
      onClick={(e) => {
        // Only trigger edit if clicking on the card itself, not buttons
        if ((e.target as HTMLElement).closest('button')) return;
        onStartEdit();
      }}
    >
      <div className="space-y-4 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] text-zinc-400 mono font-black uppercase tracking-[0.1em] px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 flex items-center gap-2">
            {entry.pinned && (
              <svg className="w-3 h-3 text-sky-400 fill-sky-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C11.45 2 11 2.45 11 3V11H3C2.45 11 2 11.45 2 12C2 12.55 2.45 13 3 13H11V21C11 21.55 11.45 22 12 22C12.55 22 13 21.55 13 21V13H21C21.55 13 22 12.55 22 12C22 11.45 21.55 11 21 11H13V3C13 2.45 12.55 2 12 2Z" transform="rotate(45 12 12)" />
              </svg>
            )}
            {formatDateLabel(entry.date)}
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-sky-500/30 group-hover:bg-sky-500 transition-colors"></div>
          <span className="text-[10px] text-indigo-400 mono font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
            {entry.shipped ? 'Artifact Validated' : 'Intelligence Logged'}
          </span>
          <span className="text-[9px] text-zinc-600 mono font-black uppercase tracking-widest opacity-0 group-hover:opacity-60 transition-opacity ml-auto">
            Click to edit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[9px] text-zinc-600 mono uppercase font-black tracking-widest">Cognitive Work</p>
            <div className="text-sm text-main font-medium leading-relaxed bullet-format whitespace-pre-wrap">
              {entry.workedOn.split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                  return <div key={i} className="flex items-start space-x-2"><span className="text-teal-500 mt-0.5">•</span><span className="flex-1">{trimmed.substring(1).trim()}</span></div>;
                }
                return <div key={i}>{line || '\u00A0'}</div>;
              })}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-zinc-600 mono uppercase font-black tracking-widest">Public Artifact</p>
            <div className="text-sm text-sky-600 font-bold tracking-tight leading-relaxed bullet-format whitespace-pre-wrap">
              {entry.shipped.split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                  return <div key={i} className="flex items-start space-x-2"><span className="text-coral-500 mt-0.5">•</span><span className="flex-1">{trimmed.substring(1).trim()}</span></div>;
                }
                return <div key={i}>{line || '\u00A0'}</div>;
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 md:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-2.5 rounded-xl border transition-all ${entry.pinned
            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20'
            : 'bg-white/5 text-zinc-500 border-white/5 hover:text-sky-400 hover:bg-sky-500/10'
            }`}
          title={entry.pinned ? 'Unpin from top' : 'Pin to top'}
        >
          <svg className={`w-4 h-4 ${entry.pinned ? 'fill-sky-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp && onMoveUp();
          }}
          disabled={!onMoveUp}
          className="p-2.5 bg-white/5 rounded-xl text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all border border-white/5 disabled:opacity-20"
          title="Move up"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown && onMoveDown();
          }}
          disabled={!onMoveDown}
          className="p-2.5 bg-white/5 rounded-xl text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all border border-white/5 disabled:opacity-20"
          title="Move down"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button
          onClick={onStartEdit}
          className="p-2.5 bg-white/5 rounded-xl text-zinc-500 hover:text-sky-400 hover:bg-sky-500/10 transition-all border border-white/5"
          title="Edit (or click anywhere on the card)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2.5 bg-white/5 rounded-xl text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-white/5"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div >
  );
};

export const DailyCapture: React.FC = () => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [formData, setFormData] = useState({
    workedOn: '',
    shipped: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showConfirm } = useConfirm();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      // First, load from local cache for instant UI
      const cached = Storage.getDailyEntries();
      if (isMounted) setEntries(cached);

      // Then, fetch fresh data from Supabase
      try {
        const fresh = await Storage.fetchDailyEntries();
        if (isMounted) setEntries(fresh);
      } catch (err) {
        console.error('Failed to sync daily logs:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workedOn || !formData.shipped || saving) return;

    setSaving(true);
    try {
      const entry: DailyEntry = {
        id: crypto.randomUUID(),
        date: selectedDate,
        traceDate: selectedDate,
        ...formData,
      };
      await Storage.saveDailyEntry(entry);
      setEntries([entry, ...entries]);

      setSaved(true);
      setFormData({ workedOn: '', shipped: '' });
      setShowAddForm(false);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleInlineSave = async (updatedEntry: DailyEntry) => {
    setSaving(true);
    try {
      await Storage.updateDailyEntry(updatedEntry);
      setEntries(entries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    const confirmed = await showConfirm('Are you sure you want to delete this log permanently? This action cannot be undone.');
    if (confirmed) {
      await Storage.deleteDailyEntry(id);
      setEntries(entries.filter(e => e.id !== id));
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  const handleTogglePin = async (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    const updatedEntry = { ...entry, pinned: !entry.pinned };
    await Storage.updateDailyEntry(updatedEntry);

    // Refresh entries from storage to ensure correct ordering
    const freshEntries = await Storage.fetchDailyEntries();
    setEntries(freshEntries);
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = entries.findIndex(e => e.id === id);
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === entries.length - 1) return;

    const newEntries = [...entries];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    // Swap items in local state for immediate feedback
    const temp = newEntries[currentIndex];
    newEntries[currentIndex] = newEntries[targetIndex];
    newEntries[targetIndex] = temp;

    // Assign new positions to all entries based on the new order
    const repositionedEntries = newEntries.map((e, i) => ({ ...e, position: i }));
    setEntries(repositionedEntries);

    // Save repositioned entries to ensure consistency on refresh
    await Promise.all(repositionedEntries.map(e => Storage.updateDailyEntry(e)));
  };

  const handleShuffle = async () => {
    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    const repositioned = shuffled.map((e, i) => ({ ...e, position: i, pinned: false })); // Pinning reset for true shuffle? Or keep pinned?
    setEntries(repositioned);
    await Promise.all(repositioned.map(e => Storage.updateDailyEntry(e)));
  };

  const formatDateLabel = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = getLocalDate(today);
    const yesterdayStr = getLocalDate(yesterday);

    if (dateStr === todayStr) return "Today";
    if (dateStr === yesterdayStr) return "Yesterday";

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getQuickDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = getLocalDate(date);
      const hasEntry = entries.some(e => e.date === dateStr);

      let label = '';
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Yesterday';
      else label = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

      dates.push({ date: dateStr, label, hasEntry });
    }

    return dates;
  };

  const isFormValid = formData.workedOn && formData.shipped;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header with Add Button */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-[1px] bg-gradient-to-r from-sky-500 to-transparent"></div>
            <span className="text-[10px] font-black mono uppercase tracking-[0.4em] text-zinc-500">Operation: Data Ingest</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-main font-heading uppercase">DAILY CAPTURE</h2>
          <p className="text-zinc-500 mt-4 max-w-lg leading-relaxed font-medium hidden md:block">
            Zero reflection. Zero planning. Just data. System integrity depends on your honesty.
          </p>
        </div>

        {/* Add Log Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShuffle}
            className="flex items-center space-x-3 px-6 py-4 rounded-2xl font-black text-sm transition-all bg-white/5 text-zinc-500 hover:bg-white/10 border border-white/5 group"
            title="Randomly shuffle all logs"
          >
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="uppercase tracking-widest text-[10px]">Shuffle</span>
          </button>
          <button
            onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
                setFormData({ workedOn: '', shipped: '' });
              } else {
                setShowAddForm(true);
                setEditingId(null); // Cancel any inline editing
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
            <span className="uppercase tracking-widest text-[10px]">{showAddForm ? 'Cancel' : 'New Log'}</span>
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="flex items-center space-x-4">
        <div className="glass-card px-6 py-3 rounded-2xl border border-sky-500/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-sky-500"></div>
            <span className="text-[10px] font-black mono uppercase tracking-widest text-sky-400">{entries.length} Logs</span>
          </div>
        </div>
        {entries.some(e => e.date === getLocalDate()) && (
          <div className="glass-card px-6 py-3 rounded-2xl border border-emerald-500/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-black mono uppercase tracking-widest text-emerald-400">Today Logged</span>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Add Form */}
      <div className={`overflow-hidden transition-all duration-500 ${showAddForm ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative glass-card p-6 md:p-8 rounded-[2rem] space-y-6">

            {/* Date Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-main uppercase tracking-widest">New Log</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ workedOn: '', shipped: '' });
                  }}
                  className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-main transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase mono tracking-[0.2em]">Log Date:</label>
                <div className="flex flex-wrap gap-2">
                  {getQuickDates().slice(0, 3).map(({ date, label, hasEntry }) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`px-3 py-2 rounded-xl text-[9px] font-black mono uppercase tracking-widest transition-all border flex items-center space-x-1.5 ${selectedDate === date
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10'
                        }`}
                    >
                      <span>{label}</span>
                      {hasEntry && <div className={`w-1.5 h-1.5 rounded-full ${selectedDate === date ? 'bg-sky-400' : 'bg-emerald-500'}`}></div>}
                    </button>
                  ))}
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={getLocalDate()}
                    className="px-3 py-2 rounded-xl text-[9px] font-black mono uppercase tracking-widest bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">01 / The Work (Facts)</label>
                  <textarea
                    className="w-full bg-black/5 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all min-h-[100px] resize-none font-medium text-main"
                    placeholder="What exactly did the system process?"
                    value={formData.workedOn}
                    onChange={e => setFormData({ ...formData, workedOn: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">02 / The Ship (Artifacts)</label>
                  <textarea
                    className="w-full bg-black/5 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all min-h-[100px] resize-none font-medium text-main"
                    placeholder="What was pushed to the external world?"
                    value={formData.shipped}
                    onChange={e => setFormData({ ...formData, shipped: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end items-center space-x-4 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={!isFormValid || saving}
                  className="bg-white text-black text-[10px] font-black px-10 py-4 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed uppercase tracking-[0.2em] shadow-xl active:scale-95"
                >
                  {saving ? 'Processing...' : 'Commit Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-[1px] bg-slate-800"></div>
            <h3 className="text-xs font-black text-zinc-500 uppercase mono tracking-[0.4em]">Log History</h3>
          </div>
          <span className="text-[10px] text-zinc-600 mono uppercase font-black tracking-widest">{entries.length} Entries</span>
        </div>

        <div className="space-y-4 pb-20">
          {loading && entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] text-zinc-500 mono font-black uppercase tracking-widest">Resynchronizing Records...</p>
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center py-16 glass-panel border-dashed border-white/5 rounded-[2rem] text-zinc-700 mono text-sm uppercase italic tracking-widest font-bold">
              Awaiting primary record ingest
            </p>
          ) : null}
          {entries.map((entry, index) => (
            <EditableEntry
              key={entry.id}
              entry={entry}
              isEditing={editingId === entry.id}
              onStartEdit={() => {
                setEditingId(entry.id);
                setShowAddForm(false); // Close the top form if open
              }}
              onCancelEdit={() => setEditingId(null)}
              onSave={handleInlineSave}
              onDelete={() => deleteEntry(entry.id)}
              onTogglePin={() => handleTogglePin(entry.id)}
              onMoveUp={index > 0 ? () => handleMove(entry.id, 'up') : undefined}
              onMoveDown={index < entries.length - 1 ? () => handleMove(entry.id, 'down') : undefined}
              formatDateLabel={formatDateLabel}
              saving={saving}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
