import React, { useEffect, useState } from 'react';
import { Storage } from '../lib/store';
import { Todo, Idea, DailyEntry, WeeklyOutcome, Discovery, Contact, TodoPriority, TimeSlot, TodoStatus } from '../lib/types';
import { getLocalDate } from '../lib/date';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomTimePicker } from './CustomTimePicker';

// Expandable Card Component
const ExpandableCard: React.FC<{
  title: string;
  subtitle?: string;
  details?: React.ReactNode;
  className?: string;
  accentColor?: string;
  onEdit?: () => void;
  pinned?: boolean;
}> = ({ title, subtitle, details, className = '', accentColor = 'sky', onEdit, pinned }) => {
  const [expanded, setExpanded] = useState(false);

  const colorClasses: Record<string, { border: string; bg: string; text: string; light: string }> = {
    sky: { border: 'border-sky-500/30', bg: 'bg-sky-50', text: 'text-sky-700', light: 'bg-sky-50' },
    purple: { border: 'border-purple-500/30', bg: 'bg-purple-50', text: 'text-purple-700', light: 'bg-purple-50' },
    emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-50', text: 'text-emerald-700', light: 'bg-emerald-50' },
    amber: { border: 'border-amber-500/30', bg: 'bg-amber-50', text: 'text-amber-700', light: 'bg-amber-50' },
  };

  const colors = colorClasses[accentColor] || colorClasses.sky;

  return (
    <div
      className={`glass-card p-5 rounded-3xl border border-slate-100 hover:${colors.border} transition-all cursor-pointer shadow-sm hover:shadow-md ${className}`}
      onClick={() => details && setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-[15px] text-zinc-700 font-semibold ${expanded ? '' : 'line-clamp-2'} leading-snug`}>{title}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {pinned && (
              <span className="text-[9px] font-bold mono uppercase tracking-widest px-2 py-0.5 rounded-md inline-block border bg-amber-100 text-amber-700 border-amber-300 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                PINNED
              </span>
            )}
            {subtitle && (
              <p className={`text-[9px] font-bold mono uppercase tracking-widest px-2 py-0.5 rounded-md inline-block border ${colors.light} ${colors.text} border-current/20`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1.5 ml-4">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className={`p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all border border-slate-200`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {details && (
            <div className={`p-2 rounded-xl bg-slate-50 text-slate-400 transition-all border border-slate-100`}>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {details && (
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'mt-6 max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className={`pt-6 border-t border-slate-100`}>
            {details}
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard Task Component
const DashboardTask: React.FC<{
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  isOverdue?: boolean;
}> = ({ todo, onToggle, onEdit, isOverdue }) => {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'border-rose-500/30 bg-rose-500/5 text-rose-400';
      case 'High': return 'border-orange-500/30 bg-orange-500/5 text-orange-400';
      case 'Medium': return 'border-sky-500/30 bg-sky-500/5 text-sky-400';
      default: return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
    }
  };

  const colors = getPriorityColor(todo.priority);

  return (
    <div
      className={`glass-card p-4 rounded-2xl border ${isOverdue ? 'border-rose-500/30 bg-rose-500/5' : colors.split(' text')[0]} hover:shadow-lg transition-all cursor-pointer`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start space-x-4">
        {/* Checkbox Wrapper for better hit area */}
        <div className="pt-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(todo); }}
            className={`w-6 h-6 rounded-xl border-2 transition-all flex items-center justify-center ${isOverdue ? 'border-rose-500 bg-rose-50 hover:bg-rose-500/20' : 'border-zinc-300 hover:border-sky-500 bg-white shadow-sm'}`}
          >
            <div className={`w-3 h-3 rounded-md bg-sky-500 scale-0 transition-transform ${todo.completed ? 'scale-100' : ''}`} />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <p className={`text-base font-semibold text-zinc-700 tracking-tight ${expanded ? 'whitespace-normal' : 'truncate'}`}>
              {todo.title}
            </p>
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(todo); }}
                className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-sky-400 transition-all"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <svg
                className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Pinned Badge */}
            {todo.pinned && (
              <span className="text-[10px] font-bold mono uppercase tracking-widest px-2.5 py-1 rounded-lg border bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1.5 shadow-sm">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                PINNED
              </span>
            )}

            {/* Priority Badge */}
            <span className={`text-[10px] font-bold mono uppercase tracking-widest px-2.5 py-1 rounded-lg border ${colors} bg-white shadow-sm`}>
              {todo.priority}
            </span>

            {/* Timing & Deadline Badges - High Visibility */}
            {todo.timeSlot && (
              <span className={`text-[10px] font-bold mono uppercase tracking-widest px-2.5 py-1 rounded-lg border flex items-center gap-1.5 shadow-sm ${todo.timeSlot === 'Anytime'
                ? 'bg-slate-100 text-slate-800 border-slate-300'
                : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {todo.timeSlot}
              </span>
            )}

            {(todo.targetTime || isOverdue) && (
              <span className={`text-[10px] font-bold mono uppercase tracking-widest px-2.5 py-1 rounded-lg border flex items-center gap-1.5 shadow-sm ${isOverdue ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isOverdue ? new Date(todo.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : todo.targetTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && todo.details && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-zinc-400 leading-relaxed italic">
            "{todo.details}"
          </p>
        </div>
      )}
    </div>
  );
};

// Task Editor Component
const DashboardTaskEditor: React.FC<{
  todo: Todo;
  onSave: (updated: Todo) => void;
  onCancel: () => void;
  saving: boolean;
}> = ({ todo, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState({ ...todo });

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-sky-500/20 shadow-2xl animate-in zoom-in-95 duration-200 relative z-[100]" style={{ overflow: 'visible' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black text-sky-500 uppercase tracking-widest mono">Modify Mission</h3>
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-slate-100 text-zinc-400 hover:text-rose-500 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1 mb-2">Mission Title</label>
          <input
            type="text"
            className="w-full bg-slate-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-main focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all placeholder:text-zinc-400"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter mission title..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomDatePicker
            label="Deadline"
            value={formData.deadline}
            onChange={val => setFormData({ ...formData, deadline: val })}
          />
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1 mb-2">Priority</label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-main focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all appearance-none"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as TodoPriority })}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Priority</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1 mb-2">Time Slot</label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-main focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all appearance-none"
                value={formData.timeSlot}
                onChange={e => setFormData({ ...formData, timeSlot: e.target.value as TimeSlot })}
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
                <option value="Anytime">Anytime</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <CustomTimePicker
            label="Target Time"
            value={formData.targetTime || ''}
            onChange={val => setFormData({ ...formData, targetTime: val })}
          />
        </div>

        <div>
          <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1 mb-2">Briefing</label>
          <textarea
            className="w-full bg-slate-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-main focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all h-24 resize-none placeholder:text-zinc-400"
            value={formData.details}
            onChange={e => setFormData({ ...formData, details: e.target.value })}
            placeholder="Add mission details..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => onSave(formData)}
            disabled={saving}
            className="flex-1 py-3.5 bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Updating...' : 'Confirm Update'}
          </button>
          <button
            onClick={onCancel}
            className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]"
          >
            Abort
          </button>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<{ setView: (v: any) => void }> = ({ setView }) => {
  const [todayTodos, setTodayTodos] = useState<Todo[]>([]);
  const [overdueTodos, setOverdueTodos] = useState<Todo[]>([]);
  const [pinnedTodos, setPinnedTodos] = useState<Todo[]>([]);
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([]);
  const [todayLog, setTodayLog] = useState<DailyEntry | null>(null);
  const [currentWeek, setCurrentWeek] = useState<WeeklyOutcome | null>(null);
  const [recentDiscoveries, setRecentDiscoveries] = useState<Discovery[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [syncing, setSyncing] = useState(true);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [updateSaving, setUpdateSaving] = useState(false);

  const loadAllData = async () => {
    const today = getLocalDate();
    try {
      const [todos, ideas, dailies, weekly, discoveries, contacts] = await Promise.all([
        Storage.fetchTodos(),
        Storage.fetchIdeas(),
        Storage.fetchDailyEntries(),
        Storage.fetchWeeklyOutcomes(),
        Storage.fetchDiscoveries(),
        Storage.fetchContacts(),
      ]);

      // Sort helper: pinned items first
      const sortByPinned = <T extends { pinned?: boolean }>(items: T[]) => {
        return items.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return 0;
        });
      };

      // Todos - filter and sort
      const pinnedTasks = todos.filter(t => t.pinned && !t.completed);
      const overdueTasks = todos.filter(t => t.deadline < today && !t.completed && !t.pinned);
      const todayTasks = todos.filter(t => t.deadline === today && !t.completed && !t.pinned);

      // Sort pinned tasks by priority/date (reusing implicit sort from fetchTodos or default)
      setPinnedTodos(pinnedTasks);
      setTodayTodos(todayTasks);
      setOverdueTodos(overdueTasks);

      // Ideas - filter inbox items, sort by pinned, then take top 3
      const inboxIdeas = ideas.filter(i => i.status === 'Inbox');
      setRecentIdeas(sortByPinned(inboxIdeas).slice(0, 3));

      // Discoveries - sort by pinned, then take top 3
      setRecentDiscoveries(sortByPinned([...discoveries]).slice(0, 3));

      const todayEntry = dailies.find(d => d.date === today);
      setTodayLog(todayEntry || null);
      if (weekly.length > 0) setCurrentWeek(weekly[0]);
      setTotalContacts(contacts.length);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleUpdateTodo = async (updatedTodo: Todo) => {
    setUpdateSaving(true);
    try {
      await Storage.updateTodo(updatedTodo);
      await loadAllData();
      setEditingTodoId(null);
    } finally {
      setUpdateSaving(false);
    }
  };

  const toggleComplete = async (todo: Todo) => {
    const updated = { ...todo, completed: !todo.completed, status: (!todo.completed ? 'Completed' : 'Pending') as any };
    await Storage.updateTodo(updated);

    const today = getLocalDate();
    setTodayTodos(prev => prev.filter(t => t.id !== todo.id));
    setOverdueTodos(prev => prev.filter(t => t.id !== todo.id));
    setPinnedTodos(prev => prev.filter(t => t.id !== todo.id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'border-rose-500/30 bg-rose-500/5';
      case 'High': return 'border-orange-500/30 bg-orange-500/5';
      case 'Medium': return 'border-sky-500/30 bg-sky-500/5';
      default: return 'border-emerald-500/30 bg-emerald-500/5';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-rose-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-sky-400';
      default: return 'text-emerald-400';
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Late Night Operations';
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 22) return 'Good Evening';
    return 'Late Night Operations';
  };

  if (syncing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border border-sky-500/20 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 bg-sky-500/10 blur-[40px] rounded-full -z-10 animate-pulse"></div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-sm font-black text-main uppercase tracking-[0.5em] mono">Initializing AJ OS 26</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Resynchronizing Neural Grids...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <header className="flex items-end justify-between px-2 stagger-1 animate-slide-up">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-1 bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
            <p className="text-sky-500 text-[10px] font-black mono uppercase tracking-[0.3em] mb-1">System Active</p>
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-main font-heading uppercase leading-[0.9]">
            {getTimeBasedGreeting()},<br />
            <span className="text-slate-300">Commander.</span>
          </h2>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[11px] text-zinc-400 mono uppercase font-bold tracking-widest mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <div className="flex items-center space-x-3 justify-end mt-2 p-2 px-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${overdueTodos.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <p className={`text-sm font-bold mono tracking-tight ${overdueTodos.length > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {overdueTodos.length > 0 ? `${overdueTodos.length} MISSIONS CRITICAL` : 'ALL SYSTEMS NOMINAL'}
            </p>
          </div>
        </div>
      </header>

      {/* Today's Tasks */}
      <div className="space-y-4 stagger-2 animate-slide-up">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-[2px] bg-slate-900"></div>
            <h3 className="text-xs font-black text-zinc-800 uppercase mono tracking-[0.3em]">Priority Missions</h3>
          </div>
          <button
            onClick={() => setView('todos')}
            className="text-[9px] font-black mono uppercase tracking-widest text-sky-400 hover:text-sky-300 transition-colors px-4 py-2 rounded-xl border border-sky-500/20 hover:border-sky-500/40"
          >
            View All
          </button>
        </div>

        {pinnedTodos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 px-2">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-[9px] font-black mono uppercase tracking-widest text-amber-500">Pinned Missions</span>
            </div>
            {pinnedTodos.map(todo => (
              editingTodoId === todo.id ? (
                <DashboardTaskEditor
                  key={todo.id}
                  todo={todo}
                  onSave={handleUpdateTodo}
                  onCancel={() => setEditingTodoId(null)}
                  saving={updateSaving}
                />
              ) : (
                <DashboardTask
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleComplete}
                  onEdit={(t) => setEditingTodoId(t.id)}
                  isOverdue={todo.deadline < getLocalDate()}
                />
              )
            ))}
          </div>
        )}

        {overdueTodos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 px-2">
              <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-[9px] font-black mono uppercase tracking-widest text-rose-400">Overdue</span>
            </div>
            {overdueTodos.slice(0, 3).map(todo => (
              editingTodoId === todo.id ? (
                <DashboardTaskEditor
                  key={todo.id}
                  todo={todo}
                  onSave={handleUpdateTodo}
                  onCancel={() => setEditingTodoId(null)}
                  saving={updateSaving}
                />
              ) : (
                <DashboardTask
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleComplete}
                  onEdit={(t) => setEditingTodoId(t.id)}
                  isOverdue
                />
              )
            ))}
          </div>
        )}

        {todayTodos.length > 0 ? (
          <div className="space-y-2">
            {todayTodos.slice(0, 5).map(todo => (
              editingTodoId === todo.id ? (
                <DashboardTaskEditor
                  key={todo.id}
                  todo={todo}
                  onSave={handleUpdateTodo}
                  onCancel={() => setEditingTodoId(null)}
                  saving={updateSaving}
                />
              ) : (
                <DashboardTask
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleComplete}
                  onEdit={(t) => setEditingTodoId(t.id)}
                />
              )
            ))}
          </div>
        ) : (overdueTodos.length === 0 && pinnedTodos.length === 0) ? (
          <div className="glass-card p-8 rounded-2xl text-center border-dashed border-white/5">
            <p className="text-zinc-600 mono text-xs uppercase tracking-widest font-black">No missions for today</p>
          </div>
        ) : null}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-3 animate-slide-up">
        {/* Recent Ideas - Now Expandable */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-[1px] bg-slate-800"></div>
              <h3 className="text-xs font-black text-zinc-500 uppercase mono tracking-[0.4em]">Recent Ideas</h3>
            </div>
            <button
              onClick={() => setView('ideas')}
              className="text-[9px] font-black mono uppercase tracking-widest text-sky-400 hover:text-sky-300 transition-colors"
            >
              View All
            </button>
          </div>
          {recentIdeas.length > 0 ? (
            <div className="space-y-2">
              {recentIdeas.map(idea => (
                <ExpandableCard
                  key={idea.id}
                  title={idea.thought}
                  subtitle={`${idea.category === 'Content' ? 'Content' : idea.category.replace('_', ' ')}${idea.platform ? ` • ${idea.platform === 'X' ? 'X' : idea.platform}` : ''}`}
                  accentColor="purple"
                  onEdit={() => setView('ideas')}
                  pinned={idea.pinned}
                  details={
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500">Category</span>
                        <span className="text-xs text-purple-400 font-semibold">{idea.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500">Urgency</span>
                        <span className={`text-xs font-semibold ${idea.urgency === 'High' ? 'text-rose-400' : idea.urgency === 'Medium' ? 'text-amber-400' : 'text-zinc-400'}`}>
                          {idea.urgency}
                        </span>
                      </div>
                      {idea.platform && (
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500">Platform</span>
                          <span className="text-xs text-sky-400 font-semibold">{idea.platform === 'X' ? '𝕏 (Twitter)' : idea.platform}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500">Added</span>
                        <span className="text-xs text-zinc-400">{new Date(idea.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-6 rounded-2xl text-center border-dashed border-white/5">
              <p className="text-zinc-600 mono text-xs uppercase tracking-widest font-black">No ideas captured</p>
            </div>
          )}
        </div>

        {/* Discoveries Section - Moved from Bottom */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-[1px] bg-slate-800"></div>
              <h3 className="text-xs font-black text-zinc-500 uppercase mono tracking-[0.4em]">System Discoveries</h3>
            </div>
            <button
              onClick={() => setView('discoveries')}
              className="text-[9px] font-black mono uppercase tracking-widest text-sky-400 hover:text-sky-300 transition-colors"
            >
              View All
            </button>
          </div>
          {recentDiscoveries.length > 0 ? (
            <div className="space-y-2">
              {recentDiscoveries.map(disc => (
                <ExpandableCard
                  key={disc.id}
                  title={disc.title}
                  subtitle={`${disc.category} • ${disc.impact}`}
                  accentColor="emerald"
                  onEdit={() => setView('discoveries')}
                  pinned={disc.pinned}
                  details={
                    <div className="space-y-3">
                      {disc.description && (
                        <div>
                          <p className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500 mb-1">Description</p>
                          <p className="text-sm text-[#0f172a] font-medium leading-relaxed">{disc.description}</p>
                        </div>
                      )}
                      {disc.url && (
                        <div>
                          <p className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500 mb-1">Link</p>
                          <a
                            href={disc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-sky-600 hover:text-sky-700 underline break-all font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {disc.url}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500">Significance</span>
                        <span className={`text-[10px] font-black mono uppercase px-2 py-0.5 rounded border border-current/20 ${disc.impact === 'Disruptive' ? 'text-rose-600 bg-rose-50' : disc.impact === 'Exponential' ? 'text-amber-600 bg-amber-50' : 'text-zinc-600 bg-zinc-50'}`}>
                          {disc.impact}
                        </span>
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-6 rounded-2xl text-center border-dashed border-slate-200">
              <p className="text-zinc-400 mono text-[9px] uppercase tracking-widest font-black">Waiting for new intelligence...</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-4 animate-slide-up">
        {/* Current Week */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-[1px] bg-slate-800"></div>
              <h3 className="text-xs font-black text-zinc-500 uppercase mono tracking-[0.4em]">This Week</h3>
            </div>
            <button
              onClick={() => setView('weekly')}
              className="text-[9px] font-black mono uppercase tracking-widest text-sky-400 hover:text-sky-300 transition-colors"
            >
              View Plan
            </button>
          </div>
          {currentWeek ? (
            <ExpandableCard
              title={currentWeek.build || 'No build target set'}
              subtitle={`Status: ${currentWeek.status}`}
              accentColor={currentWeek.status === 'Successful' ? 'emerald' : currentWeek.status === 'Partial' ? 'amber' : 'sky'}
              onEdit={() => setView('weekly')}
              details={
                <div className="space-y-3">
                  {currentWeek.ship && (
                    <div>
                      <p className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500 mb-1">Ship Target</p>
                      <p className="text-sm text-sky-700 font-bold">{currentWeek.ship}</p>
                    </div>
                  )}
                  {currentWeek.learn && (
                    <div>
                      <p className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500 mb-1">Learn Target</p>
                      <p className="text-sm text-purple-700 font-bold">{currentWeek.learn}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500">Operation window</span>
                    <span className="text-xs text-[#0f172a] font-bold">{currentWeek.weekStarting}</span>
                  </div>
                </div>
              }
            />
          ) : (
            <div className="glass-card p-6 rounded-2xl text-center border-dashed border-slate-200">
              <p className="text-zinc-400 mono text-[9px] uppercase tracking-widest font-black">Mission parameters not set</p>
            </div>
          )}
        </div>

        {/* Network */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-[1px] bg-slate-800"></div>
              <h3 className="text-xs font-black text-zinc-500 uppercase mono tracking-[0.4em]">Network</h3>
            </div>
            <button
              onClick={() => setView('contacts')}
              className="text-[9px] font-black mono uppercase tracking-widest text-sky-400 hover:text-sky-300 transition-colors"
            >
              Manage
            </button>
          </div>
          <div className="glass-card p-6 rounded-3xl border border-slate-100 text-center shadow-sm hover:shadow-md transition-all">
            <p className="text-4xl font-black text-[#0f172a] tracking-tighter">{totalContacts}</p>
            <p className="text-[10px] font-black mono uppercase tracking-[0.2em] text-zinc-500 mt-1">Confirmed Assets</p>
          </div>
        </div>
      </div>
    </div>
  );
};
