import React, { useState, useEffect, useRef } from 'react';
import { Storage } from '../lib/store';
import { Todo, TodoPriority, TodoStatus, TimeSlot } from '../lib/types';
import { useConfirm } from './ConfirmModal';
import { getLocalDate, parseLocalDate } from '../lib/date';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomTimePicker } from './CustomTimePicker';

// Inline editable todo component
const EditableTodo: React.FC<{
    todo: Todo;
    isEditing: boolean;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSave: (updated: Todo) => Promise<void>;
    onDelete: () => void;
    onToggleComplete: () => void;
    onTogglePin: () => void;
    onUpdateStatus: (status: TodoStatus) => void;
    isOverdue: boolean;
    saving: boolean;
}> = ({ todo, isEditing, onStartEdit, onCancelEdit, onSave, onDelete, onToggleComplete, onTogglePin, onUpdateStatus, isOverdue, saving }) => {
    const [editTitle, setEditTitle] = useState(todo.title);
    const [editDetails, setEditDetails] = useState(todo.details);
    const [editDeadline, setEditDeadline] = useState(todo.deadline);
    const [editPriority, setEditPriority] = useState(todo.priority);
    const [editTimeSlot, setEditTimeSlot] = useState<TimeSlot>(todo.timeSlot || 'Anytime');
    const [editTargetTime, setEditTargetTime] = useState(todo.targetTime || '');
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            setEditTitle(todo.title);
            setEditDetails(todo.details);
            setEditDeadline(todo.deadline);
            setEditPriority(todo.priority);
            setEditTimeSlot(todo.timeSlot || 'Anytime');
            setEditTargetTime(todo.targetTime || '');
            setTimeout(() => titleRef.current?.focus(), 50);
        }
    }, [isEditing, todo]);

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
    }, [isEditing, editTitle, editDetails, editDeadline, editPriority]);

    const handleSave = async () => {
        if (!editTitle || !editDeadline || saving) return;

        const updatedTodo = {
            ...todo,
            title: editTitle,
            details: editDetails,
            deadline: editDeadline,
            priority: editPriority,
            timeSlot: editTimeSlot,
            targetTime: editTargetTime || undefined,
        };
        await onSave(updatedTodo);
    };

    if (isEditing) {
        return (
            <div className="bg-white p-5 md:p-6 rounded-2xl border-2 border-amber-500/50 shadow-lg shadow-amber-500/20 animate-pulse-border relative" style={{ overflow: 'visible' }}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Editing Task</span>
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
                                disabled={!editTitle || !editDeadline || saving}
                                className="group flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white hover:bg-amber-600 border border-amber-600 hover:border-amber-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 active:scale-95"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                                <span className="text-[8px] text-amber-100 font-normal ml-0.5">⌘↵</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Task Title</label>
                            <input
                                ref={titleRef}
                                type="text"
                                className="w-full bg-slate-50 border border-amber-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-medium text-main placeholder-zinc-400"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                placeholder="What needs to be done?"
                            />
                        </div>

                        <CustomDatePicker
                            label="Deadline"
                            value={editDeadline}
                            onChange={setEditDeadline}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Details (Optional)</label>
                        <textarea
                            className="w-full bg-slate-50 border border-amber-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all min-h-[80px] resize-y font-medium text-main placeholder-zinc-400"
                            value={editDetails}
                            onChange={e => setEditDetails(e.target.value)}
                            placeholder="Additional context..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Time Slot</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['Morning', 'Afternoon', 'Evening', 'Night', 'Anytime'] as TimeSlot[]).map(slot => (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setEditTimeSlot(slot)}
                                        className={`py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${editTimeSlot === slot
                                            ? slot === 'Morning' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                : slot === 'Afternoon' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                    : slot === 'Evening' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                                        : slot === 'Night' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                                            : 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                            : 'bg-slate-50 text-zinc-500 hover:bg-zinc-100 border border-zinc-100'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <CustomTimePicker
                            label="Target Time (Optional)"
                            value={editTargetTime}
                            onChange={setEditTargetTime}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[9px] font-black text-zinc-500 uppercase mono tracking-[0.2em] px-1">Priority</label>
                        <div className="grid grid-cols-4 gap-2">
                            {(['Low', 'Medium', 'High', 'Critical'] as TodoPriority[]).map(priority => (
                                <button
                                    key={priority}
                                    type="button"
                                    onClick={() => setEditPriority(priority)}
                                    className={`py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${editPriority === priority
                                        ? priority === 'Critical' ? 'bg-rose-500 text-white shadow-lg'
                                            : priority === 'High' ? 'bg-orange-500 text-white shadow-lg'
                                                : priority === 'Medium' ? 'bg-amber-500 text-white shadow-lg'
                                                    : 'bg-emerald-500 text-white shadow-lg'
                                        : 'bg-slate-50 text-zinc-500 hover:bg-zinc-100 border border-zinc-100'
                                        }`}
                                >
                                    {priority}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`glass-card group p-4 md:p-5 rounded-2xl hover:border-sky-500/40 transition-all duration-300 cursor-pointer ${todo.completed ? 'opacity-50' : ''
                } ${todo.priority === 'Critical' && !todo.completed
                    ? 'border-rose-500/20 bg-rose-500/[0.02]'
                    : todo.priority === 'High' && !todo.completed
                        ? 'border-orange-500/20 bg-orange-500/[0.02]'
                        : ''
                }`}
            onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                onStartEdit();
            }}
        >
            <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
                    className={`mt-1 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${todo.completed
                        ? 'bg-sky-500 border-sky-500'
                        : isOverdue
                            ? 'border-rose-500/50 hover:border-rose-500'
                            : 'border-zinc-600 hover:border-sky-500'
                        }`}
                >
                    {todo.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            {/* Pinned Badge */}
                            {todo.pinned && (
                                <div className="flex items-center gap-2 mb-2.5">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-sm">
                                        <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                        <span className="text-[11px] font-black text-amber-500 mono uppercase tracking-widest leading-none">PINNED</span>
                                    </div>
                                </div>
                            )}
                            {/* Timing Highlight */}
                            {(todo.targetTime || (todo.timeSlot && todo.timeSlot !== 'Anytime')) && (
                                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                                    {todo.targetTime && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 shadow-sm group/time">
                                            <svg className="w-3.5 h-3.5 text-purple-400 group-hover/time:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-[11px] font-black text-purple-400 mono uppercase tracking-widest leading-none">{todo.targetTime}</span>
                                        </div>
                                    )}
                                    {todo.timeSlot && todo.timeSlot !== 'Anytime' && (
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm group/slot ${todo.timeSlot === 'Morning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                            todo.timeSlot === 'Afternoon' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                                                todo.timeSlot === 'Evening' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                                                    todo.timeSlot === 'Night' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                                                        'bg-sky-500/10 border-sky-500/30 text-sky-400'
                                            }`}>
                                            {todo.timeSlot === 'Morning' && (
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                                </svg>
                                            )}
                                            {todo.timeSlot === 'Afternoon' && (
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                                </svg>
                                            )}
                                            {todo.timeSlot === 'Evening' && (
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 11a5 5 0 10-10 0M12 16v4m0 0H8m4 0h4m-4-8V3M4 11h2m12 0h2m-4.659-4.341l-1.415-1.414M7.073 6.66l-1.414-1.415" />
                                                </svg>
                                            )}
                                            {todo.timeSlot === 'Night' && (
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                </svg>
                                            )}
                                            <span className="text-[11px] font-black uppercase tracking-widest leading-none">{todo.timeSlot}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <h4 className={`text-sm font-bold text-main ${todo.completed ? 'line-through opacity-50' : ''}`}>
                                {todo.title}
                            </h4>
                            {todo.details && (
                                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{todo.details}</p>
                            )}
                            {/* Show completion timestamp for completed tasks */}
                            {todo.completed && todo.completedAt && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-[10px] font-black text-emerald-600 mono uppercase tracking-wider">
                                            Finished {new Date(todo.completedAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: new Date(todo.completedAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                            })} at {new Date(todo.completedAt).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
                                className={`p-2 rounded-lg transition-all ${todo.pinned
                                    ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                                    : 'text-zinc-600 hover:text-amber-500 hover:bg-amber-500/10'
                                    }`}
                                title={todo.pinned ? 'Unpin' : 'Pin'}
                            >
                                <svg className="w-4 h-4" fill={todo.pinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            </button>
                            <button
                                onClick={onStartEdit}
                                className="p-2 text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="p-2 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <span className={`text-[8px] font-black px-2 py-1 rounded-lg mono uppercase tracking-widest border ${todo.priority === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            todo.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                todo.priority === 'Medium' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                            {todo.priority}
                        </span>

                        {/* Status buttons */}
                        <div className="flex gap-1">
                            {(['Pending', 'In Progress', 'Completed'] as TodoStatus[]).map(status => (
                                <button
                                    key={status}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateStatus(status);
                                    }}
                                    className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${todo.status === status
                                        ? status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                            : status === 'In Progress' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                                        : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-50'
                                        }`}
                                >
                                    {status === 'In Progress' ? 'In Progress' : status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TodoList: React.FC = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        details: '',
        deadline: '',
        priority: 'Medium' as TodoPriority,
        timeSlot: 'Anytime' as TimeSlot,
        targetTime: '',
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
    const [completedDateFilter, setCompletedDateFilter] = useState<string>(''); // For filtering by completion date
    const { showConfirm } = useConfirm();

    useEffect(() => {
        setTodos(Storage.getTodos());
        Storage.fetchTodos().then(setTodos);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.deadline) return;

        setSaving(true);
        try {
            const now = new Date().toISOString();
            const newTodo: Todo = {
                id: crypto.randomUUID(),
                ...formData,
                targetTime: formData.targetTime || undefined,
                status: 'Pending',
                completed: false,
                createdAt: now,
                traceDate: getLocalDate(),
            };
            await Storage.saveTodo(newTodo);
            setTodos([newTodo, ...todos]);
            setFormData({
                title: '',
                details: '',
                deadline: '',
                priority: 'Medium',
                timeSlot: 'Anytime',
                targetTime: '',
            });
            setShowAddForm(false);
        } finally {
            setSaving(false);
        }
    };

    const handleInlineSave = async (updatedTodo: Todo) => {
        setSaving(true);
        try {
            await Storage.updateTodo(updatedTodo);
            setTodos(todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));
            setEditingId(null);
        } finally {
            setSaving(false);
        }
    };

    const toggleComplete = async (todo: Todo) => {
        const isCompleting = !todo.completed;
        const updated = {
            ...todo,
            completed: isCompleting,
            status: (isCompleting ? 'Completed' : 'Pending') as TodoStatus,
            completedAt: isCompleting ? new Date().toISOString() : undefined
        };
        await Storage.updateTodo(updated);
        setTodos(todos.map(t => t.id === todo.id ? updated : t));
    };

    const updateStatus = async (todo: Todo, status: TodoStatus) => {
        const isCompleting = status === 'Completed' && !todo.completed;
        const isUncompleting = status !== 'Completed' && todo.completed;
        const updated = {
            ...todo,
            status,
            completed: status === 'Completed',
            completedAt: isCompleting ? new Date().toISOString() : (isUncompleting ? undefined : todo.completedAt)
        };
        await Storage.updateTodo(updated);
        setTodos(todos.map(t => t.id === todo.id ? updated : t));
    };

    const deleteTodo = async (id: string) => {
        const confirmed = await showConfirm('Delete this task? This action cannot be undone.');
        if (confirmed) {
            await Storage.deleteTodo(id);
            setTodos(todos.filter(t => t.id !== id));
            if (editingId === id) {
                setEditingId(null);
            }
        }
    };

    const togglePin = async (todo: Todo) => {
        const updated = { ...todo, pinned: !todo.pinned };
        await Storage.updateTodo(updated);
        setTodos(todos.map(t => t.id === todo.id ? updated : t));
    };

    const getFilteredTodos = () => {
        const today = getLocalDate();
        let filtered = todos;

        switch (filter) {
            case 'today':
                filtered = todos.filter(t => t.deadline === today && !t.completed);
                break;
            case 'upcoming':
                filtered = todos.filter(t => t.deadline > today && !t.completed);
                break;
            case 'completed':
                filtered = todos.filter(t => t.completed);
                break;
            default:
                filtered = todos;
        }

        // Apply completion date filter if set
        if (completedDateFilter && filter === 'completed') {
            filtered = filtered.filter(t => {
                if (!t.completedAt) return false;
                const completedDate = getLocalDate(new Date(t.completedAt));
                return completedDate === completedDateFilter;
            });
        }

        return filtered;
    };

    // Group todos by date - separate pending and completed
    const groupTodosByDate = (todoList: Todo[]) => {
        const today = getLocalDate();

        // Separate pending and completed
        const pendingTodos = todoList.filter(t => !t.completed);
        const completedTodos = todoList.filter(t => t.completed);

        // Separate pinned from pending
        const pinnedTodos = pendingTodos.filter(t => t.pinned);
        const unpinnedTodos = pendingTodos.filter(t => !t.pinned);

        // Group unpinned by date
        const pendingGroups: { [key: string]: Todo[] } = {};
        unpinnedTodos.forEach(todo => {
            const dateKey = todo.deadline;
            if (!pendingGroups[dateKey]) {
                pendingGroups[dateKey] = [];
            }
            pendingGroups[dateKey].push(todo);
        });

        // Sort pending dates: overdue first, then today, then future
        const sortedPendingDates = Object.keys(pendingGroups).sort((a, b) => {
            if (a < today && b >= today) return -1;
            if (b < today && a >= today) return 1;
            return a.localeCompare(b);
        });

        const pendingResult = [];

        // Add Pinned Group first if exists
        if (pinnedTodos.length > 0) {
            pendingResult.push({
                date: 'pinned',
                todos: pinnedTodos.sort((a, b) => {
                    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
                    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                    }
                    if (a.deadline !== b.deadline) {
                        return a.deadline.localeCompare(b.deadline);
                    }
                    return 0;
                }),
                isOverdue: false,
                isToday: false,
                isCompleted: false,
                isPinned: true
            });
        }

        // Add date-based groups
        const dateGroups = sortedPendingDates.map(date => ({
            date,
            todos: pendingGroups[date].sort((a, b) => {
                const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                }

                // If priorities are equal, sort by timeSlot
                const timeSlotOrder = { Morning: 0, Afternoon: 1, Evening: 2, Night: 3, Anytime: 4 };
                const aSlot = a.timeSlot || 'Anytime';
                const bSlot = b.timeSlot || 'Anytime';

                if (timeSlotOrder[aSlot] !== timeSlotOrder[bSlot]) {
                    return timeSlotOrder[aSlot] - timeSlotOrder[bSlot];
                }

                // If timeSlots are equal, sort by targetTime
                if (a.targetTime && b.targetTime) {
                    return a.targetTime.localeCompare(b.targetTime);
                }
                if (a.targetTime) return -1;
                if (b.targetTime) return 1;

                return 0;
            }),
            isOverdue: date < today,
            isToday: date === today,
            isCompleted: false,
            isPinned: false
        }));

        pendingResult.push(...dateGroups);

        // Add completed section at the bottom (if filter is 'all' or 'completed')
        if (completedTodos.length > 0 && (filter === 'all' || filter === 'completed')) {
            // Group completed tasks by completion date
            const completedGroups: { [key: string]: Todo[] } = {};
            completedTodos.forEach(todo => {
                const dateKey = todo.completedAt
                    ? getLocalDate(new Date(todo.completedAt))
                    : 'unknown';
                if (!completedGroups[dateKey]) {
                    completedGroups[dateKey] = [];
                }
                completedGroups[dateKey].push(todo);
            });

            // Sort completion dates in reverse chronological order (most recent first)
            const sortedCompletedDates = Object.keys(completedGroups).sort((a, b) => {
                if (a === 'unknown') return 1;
                if (b === 'unknown') return -1;
                return b.localeCompare(a);
            });

            // Add each completion date as a separate group
            sortedCompletedDates.forEach(date => {
                pendingResult.push({
                    date: date,
                    todos: completedGroups[date].sort((a, b) => {
                        // Sort by completion time (most recent first)
                        if (a.completedAt && b.completedAt) {
                            return b.completedAt.localeCompare(a.completedAt);
                        }
                        return 0;
                    }),
                    isOverdue: false,
                    isToday: false,
                    isCompleted: true,
                    isPinned: false,
                    completionDate: date
                });
            });
        }

        return pendingResult;
    };

    const filteredTodos = getFilteredTodos();
    const groupedTodos = groupTodosByDate(filteredTodos);
    const todayCount = todos.filter(t => t.deadline === getLocalDate() && !t.completed).length;
    const overdueCount = todos.filter(t => t.deadline < getLocalDate() && !t.completed).length;

    const formatDateHeader = (dateStr: string, isOverdue: boolean, isToday: boolean, isCompleted?: boolean, isPinned?: boolean) => {
        if (isPinned || dateStr === 'pinned') return 'Pinned';

        // Handle completed tasks with completion date
        if (isCompleted) {
            if (dateStr === 'unknown' || dateStr === 'completed') {
                return 'Completed (Date Unknown)';
            }
            const date = parseLocalDate(dateStr);
            const today = new Date();
            const todayStr = getLocalDate(today);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = getLocalDate(yesterday);

            if (dateStr === todayStr) return 'Completed Today';
            if (dateStr === yesterdayStr) return 'Completed Yesterday';
            return `Completed on ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
        }

        const date = parseLocalDate(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStr = getLocalDate(today);
        const tomorrowStr = getLocalDate(tomorrow);

        if (dateStr === todayStr) return 'Today';
        if (dateStr === tomorrowStr) return 'Tomorrow';
        if (isOverdue) return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;

        return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
    };

    const isOverdue = (deadline: string) => deadline < getLocalDate();

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Header with Add Button */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="h-[1px] w-10 bg-gradient-to-r from-sky-500 to-transparent"></div>
                        <span className="text-[10px] font-black mono uppercase tracking-[0.4em] text-zinc-500">Operation: Task Command</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter text-main font-heading uppercase">MISSION CONTROL</h2>
                    <p className="text-zinc-500 mt-4 max-w-lg leading-relaxed font-medium hidden md:block">
                        Command center for daily operations. Track objectives, manage deadlines, and execute with precision.
                    </p>
                </div>

                {/* Add Task Button */}
                <button
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        if (showAddForm) {
                            setFormData({
                                title: '',
                                details: '',
                                deadline: '',
                                priority: 'Medium',
                                timeSlot: 'Anytime',
                                targetTime: '',
                            });
                        } else {
                            setEditingId(null);
                        }
                    }}
                    className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-black text-sm transition-all ${showAddForm
                        ? 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200'
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
                    <span className="uppercase tracking-widest text-[10px]">{showAddForm ? 'Cancel' : 'New Task'}</span>
                </button>
            </header>

            {/* Stats Bar */}
            <div className="flex items-center space-x-4">
                <div className="glass-card px-6 py-3 rounded-2xl border border-sky-500/20">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                        <span className="text-[10px] font-black mono uppercase tracking-widest text-sky-400">{todayCount} Today</span>
                    </div>
                </div>
                {overdueCount > 0 && (
                    <div className="glass-card px-6 py-3 rounded-2xl border border-rose-500/20">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                            <span className="text-[10px] font-black mono uppercase tracking-widest text-rose-400">{overdueCount} Overdue</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Collapsible Add Form */}
            <div className={`overflow-hidden transition-all duration-500 ${showAddForm ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative bg-white p-6 md:p-8 rounded-[2rem] space-y-6 border border-slate-200 shadow-sm" style={{ overflow: 'visible' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-main uppercase tracking-widest">New Task</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setFormData({
                                        title: '',
                                        details: '',
                                        deadline: '',
                                        priority: 'Medium',
                                        timeSlot: 'Anytime',
                                        targetTime: '',
                                    });
                                }}
                                className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-main transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-zinc-500 uppercase mono tracking-[0.3em] px-1">Mission Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-zinc-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-sky-500 font-medium text-main"
                                    placeholder="What needs to be accomplished?"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <CustomDatePicker
                                label="Target Deadline"
                                value={formData.deadline}
                                onChange={val => setFormData({ ...formData, deadline: val })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-zinc-500 uppercase mono tracking-[0.3em] px-1">Time Slot</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['Morning', 'Afternoon', 'Evening', 'Night', 'Anytime'] as TimeSlot[]).map(slot => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, timeSlot: slot })}
                                            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${formData.timeSlot === slot
                                                ? slot === 'Morning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                    : slot === 'Afternoon' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                                        : slot === 'Evening' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                                            : slot === 'Night' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                                                : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                                : 'bg-slate-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <CustomTimePicker
                                label="Target Time (Optional)"
                                value={formData.targetTime}
                                onChange={val => setFormData({ ...formData, targetTime: val })}
                            />

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-zinc-500 uppercase mono tracking-[0.3em] px-1">Mission Brief (Optional)</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-zinc-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-sky-500 transition-all h-20 resize-none font-medium text-main leading-relaxed"
                                    placeholder="Additional context or steps..."
                                    value={formData.details}
                                    onChange={e => setFormData({ ...formData, details: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-zinc-500 uppercase mono tracking-[0.3em] px-1">Priority Level</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['Low', 'Medium', 'High', 'Critical'] as TodoPriority[]).map(priority => (
                                        <button
                                            key={priority}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority })}
                                            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${formData.priority === priority
                                                ? priority === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                                    : priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                                        : priority === 'Medium' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                                                : 'bg-slate-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100'
                                                }`}
                                        >
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end items-center space-x-4 pt-4 border-t border-zinc-100">
                            <button
                                type="submit"
                                disabled={!formData.title || !formData.deadline || saving}
                                className="bg-white text-black text-[10px] font-black px-10 py-4 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-20 uppercase tracking-[0.3em] shadow-xl active:scale-95"
                            >
                                {saving ? 'Deploying...' : 'Deploy'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 px-2">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-[1px] bg-slate-800"></div>
                    <h3 className="text-sm font-black text-zinc-500 uppercase mono tracking-[0.3em]">Tasks</h3>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    {(['all', 'today', 'upcoming', 'completed'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => {
                                setFilter(f);
                                if (f !== 'completed') {
                                    setCompletedDateFilter('');
                                }
                            }}
                            className={`text-[9px] font-black mono uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${filter === f
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                : 'text-zinc-600 hover:text-zinc-400 border border-transparent'
                                }`}
                        >
                            {f}
                        </button>
                    ))}

                    {/* Date filter for completed tasks */}
                    {filter === 'completed' && (
                        <div className="flex items-center gap-2 ml-2">
                            <span className="text-[11px] font-black text-zinc-500 uppercase mono tracking-widest">Filter by date:</span>
                            <input
                                type="date"
                                value={completedDateFilter}
                                onChange={(e) => setCompletedDateFilter(e.target.value)}
                                className="text-[10px] font-medium px-3 py-1.5 rounded-lg border border-zinc-200 bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                            />
                            {completedDateFilter && (
                                <button
                                    onClick={() => setCompletedDateFilter('')}
                                    className="text-[9px] font-black mono uppercase tracking-widest px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Grouped Tasks by Date */}
            <div className="space-y-6 pb-20">
                {groupedTodos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <h4 className="text-sm font-bold text-main uppercase tracking-widest mb-1">All Systems Nominal</h4>
                        <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">No pending missions for this cycle. <br />Initiate new objectives to maintain momentum.</p>
                    </div>
                )}

                {groupedTodos.map(group => (
                    <div key={group.date} className="space-y-3">
                        {/* Date Header */}
                        <div className={`flex items-center space-x-3 px-2 py-2 ${group.isPinned ? 'text-amber-500' :
                            group.isCompleted ? 'text-emerald-400' :
                                group.isOverdue ? 'text-rose-400' :
                                    group.isToday ? 'text-sky-400' : 'text-zinc-500'
                            }`}>
                            <div className={`w-6 h-[2px] rounded-full ${group.isPinned ? 'bg-amber-500/50' :
                                group.isCompleted ? 'bg-emerald-500/50' :
                                    group.isOverdue ? 'bg-rose-500/50' :
                                        group.isToday ? 'bg-sky-500/50' : 'bg-zinc-700'
                                }`}></div>
                            <span className="text-sm font-black mono uppercase tracking-[0.2em]">
                                {formatDateHeader(group.date, group.isOverdue, group.isToday, group.isCompleted, group.isPinned)}
                            </span>
                            <span className="text-[11px] font-black mono text-zinc-600">
                                ({group.todos.length} {group.isCompleted ? 'done' : 'pending'})
                            </span>
                        </div>

                        {/* Tasks for this date */}
                        <div className="space-y-2 pl-2">
                            {group.todos.map(todo => (
                                <EditableTodo
                                    key={todo.id}
                                    todo={todo}
                                    isEditing={editingId === todo.id}
                                    onStartEdit={() => {
                                        setEditingId(todo.id);
                                        setShowAddForm(false);
                                    }}
                                    onCancelEdit={() => setEditingId(null)}
                                    onSave={handleInlineSave}
                                    onDelete={() => deleteTodo(todo.id)}
                                    onToggleComplete={() => toggleComplete(todo)}
                                    onTogglePin={() => togglePin(todo)}
                                    onUpdateStatus={(status) => updateStatus(todo, status)}
                                    isOverdue={isOverdue(todo.deadline)}
                                    saving={saving}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
