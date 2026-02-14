import React, { useState, useEffect, useMemo } from 'react';
import { Storage } from '../lib/store';
import { DailyEntry, Todo, Idea, Discovery, Contact, WeeklyOutcome } from '../lib/types';
import { getLocalDate } from '../lib/date';

// AJ OS Insights Start Date - All data before this is ignored
const SYSTEM_START_DATE = '2026-01-12';

interface WeeklyStats {
    weekLabel: string;
    weekStart: string;
    weekEnd: string;
    daysLogged: number;
    tasksCreated: number;
    tasksCompleted: number;
    ideasAdded: number;
    ideasExecuted: number;
    discoveriesAdded: number;
    contactsAdded: number;
    outcomesAchieved: number;
    outcomesTotal: number;
}

export const Insights: React.FC = () => {
    const [dailyLogs, setDailyLogs] = useState<DailyEntry[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [weeklyOutcomes, setWeeklyOutcomes] = useState<WeeklyOutcome[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [logs, fetchedTodos, fetchedIdeas, fetchedDiscoveries, fetchedContacts, fetchedOutcomes] = await Promise.all([
                    Storage.fetchDailyEntries(),
                    Storage.fetchTodos(),
                    Storage.fetchIdeas(),
                    Storage.fetchDiscoveries(),
                    Storage.fetchContacts(),
                    Storage.fetchWeeklyOutcomes(),
                ]);

                // Filter data to only include items from SYSTEM_START_DATE onwards
                setDailyLogs(logs.filter(l => l.date >= SYSTEM_START_DATE));
                setTodos(fetchedTodos.filter(t => (t.traceDate || t.deadline) >= SYSTEM_START_DATE));
                setIdeas(fetchedIdeas.filter(i => (i.traceDate || i.date) >= SYSTEM_START_DATE));
                setDiscoveries(fetchedDiscoveries.filter(d => (d.traceDate || d.dateAdded) >= SYSTEM_START_DATE));
                setContacts(fetchedContacts.filter(c => (c.traceDate || c.dateAdded) >= SYSTEM_START_DATE));
                setWeeklyOutcomes(fetchedOutcomes.filter(o => (o.traceDate || o.weekStarting) >= SYSTEM_START_DATE));
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Helper: Get week start (Monday) for a date
    const getWeekStart = (date: Date): Date => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    // Helper: Format date as YYYY-MM-DD
    const formatDate = (date: Date): string => getLocalDate(date);

    // Helper: Get week label
    const getWeekLabel = (weekStart: Date): string => {
        const now = new Date();
        const currentWeekStart = getWeekStart(now);
        const diffDays = Math.floor((currentWeekStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);

        if (diffWeeks === 0) return 'This Week';
        if (diffWeeks === 1) return 'Last Week';
        return `${diffWeeks} Weeks Ago`;
    };

    // Calculate days since system start
    const daysSinceStart = useMemo(() => {
        const start = new Date(SYSTEM_START_DATE);
        const now = new Date();
        return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, []);

    // Calculate comprehensive metrics
    const metrics = useMemo(() => {
        const today = new Date();
        const todayStr = formatDate(today);

        // Generate date ranges (capped to system start)
        const maxDays = Math.min(30, daysSinceStart + 1);
        const last30Days = Array.from({ length: maxDays }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            return formatDate(d);
        }).filter(d => d >= SYSTEM_START_DATE);

        const last7Days = last30Days.slice(0, Math.min(7, last30Days.length));

        // ===== DAILY LOGS METRICS =====
        const logDates = [...new Set(dailyLogs.map(l => l.date))].sort().reverse();

        // Streak calculation
        let streak = 0;
        for (let i = 0; i < last30Days.length; i++) {
            if (logDates.includes(last30Days[i])) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        const daysLoggedThisWeek = last7Days.filter(d => logDates.includes(d)).length;
        const daysLoggedLast30 = last30Days.filter(d => logDates.includes(d)).length;
        const consistencyScore = last30Days.length > 0
            ? Math.round((daysLoggedLast30 / last30Days.length) * 100)
            : 0;
        const daysSinceLastLog = logDates.length > 0
            ? Math.floor((today.getTime() - new Date(logDates[0] as string).getTime()) / (1000 * 60 * 60 * 24))
            : -1;

        // ===== TASK METRICS =====
        const pendingTasks = todos.filter(t => !t.completed);
        const completedTasks = todos.filter(t => t.completed);
        const overdueTasks = pendingTasks.filter(t => t.deadline < todayStr);
        const tasksDueToday = pendingTasks.filter(t => t.deadline === todayStr);
        const tasksDueThisWeek = pendingTasks.filter(t => last7Days.includes(t.deadline));
        const inProgressTasks = pendingTasks.filter(t => t.status === 'In Progress');

        const tasksByPriority = {
            Critical: pendingTasks.filter(t => t.priority === 'Critical').length,
            High: pendingTasks.filter(t => t.priority === 'High').length,
            Medium: pendingTasks.filter(t => t.priority === 'Medium').length,
            Low: pendingTasks.filter(t => t.priority === 'Low').length,
        };

        const recentTasks = todos.filter(t =>
            last30Days.includes(t.deadline) || last30Days.includes(t.traceDate || '')
        );
        const completionRate = recentTasks.length > 0
            ? Math.round((recentTasks.filter(t => t.completed).length / recentTasks.length) * 100)
            : 0;

        const tasksCompletedThisWeek = completedTasks.filter(t =>
            last7Days.includes(t.deadline) || last7Days.includes(t.traceDate || '')
        ).length;

        // ===== IDEA METRICS =====
        const executedIdeas = ideas.filter(i => i.executed);
        const pendingIdeas = ideas.filter(i => !i.executed);
        const highUrgencyPending = pendingIdeas.filter(i => i.urgency === 'High');
        const contentIdeas = ideas.filter(i => i.category === 'Content');
        const xIdeas = contentIdeas.filter(i => i.platform === 'X');
        const linkedInIdeas = contentIdeas.filter(i => i.platform === 'LinkedIn');

        const ideaExecutionRate = ideas.length > 0
            ? Math.round((executedIdeas.length / ideas.length) * 100)
            : 0;

        const ideasByCategory = {
            Content: ideas.filter(i => i.category === 'Content').length,
            Product: ideas.filter(i => i.category === 'Product').length,
            Deep_Work: ideas.filter(i => i.category === 'Deep_Work').length,
            Life: ideas.filter(i => i.category === 'Life').length,
            Growth: ideas.filter(i => i.category === 'Growth').length,
        };

        const oldestPendingIdea = pendingIdeas
            .map(i => i.date || i.traceDate)
            .filter(d => d && d >= SYSTEM_START_DATE)
            .sort()[0];
        const oldestIdeaAge = oldestPendingIdea
            ? Math.floor((today.getTime() - new Date(oldestPendingIdea).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

        // ===== DISCOVERY METRICS =====
        const disruptiveDiscoveries = discoveries.filter(d => d.impact === 'Disruptive');
        const exponentialDiscoveries = discoveries.filter(d => d.impact === 'Exponential');
        const linearDiscoveries = discoveries.filter(d => d.impact === 'Linear');

        // ===== CONTACT METRICS =====
        const contactsThisMonth = contacts.filter(c =>
            last30Days.includes(c.dateAdded) || last30Days.includes(c.traceDate || '')
        ).length;

        // ===== WEEKLY OUTCOME METRICS =====
        const achievedOutcomes = weeklyOutcomes.filter(o => o.achieved);
        const outcomeRate = weeklyOutcomes.length > 0
            ? Math.round((achievedOutcomes.length / weeklyOutcomes.length) * 100)
            : 0;

        // ===== GAPS DETECTION =====
        const gaps: string[] = [];

        if (daysSinceLastLog > 0 && dailyLogs.length > 0) {
            if (daysSinceLastLog === 1) {
                gaps.push('You missed logging yesterday - get back on track today');
            } else if (daysSinceLastLog > 1) {
                gaps.push(`${daysSinceLastLog} days since your last log - consistency matters`);
            }
        }
        if (overdueTasks.length > 0) {
            gaps.push(`${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} - clear these first`);
        }
        if (highUrgencyPending.length > 0) {
            gaps.push(`${highUrgencyPending.length} high-urgency idea${highUrgencyPending.length > 1 ? 's' : ''} waiting to be executed`);
        }
        if (consistencyScore < 50 && dailyLogs.length > 7) {
            gaps.push(`${consistencyScore}% consistency in last 30 days - aim for daily logging`);
        }
        if (pendingTasks.length > 15) {
            gaps.push(`${pendingTasks.length} pending tasks - consider pruning or prioritizing`);
        }
        if (tasksByPriority.Critical > 0) {
            gaps.push(`${tasksByPriority.Critical} critical task${tasksByPriority.Critical > 1 ? 's' : ''} - handle immediately`);
        }
        if (oldestIdeaAge > 14 && pendingIdeas.length > 0) {
            gaps.push(`Ideas ${oldestIdeaAge}+ days old - execute or archive them`);
        }
        if (outcomeRate < 50 && weeklyOutcomes.length >= 4) {
            gaps.push(`Only ${outcomeRate}% of target outcomes achieved - set realistic goals`);
        }

        // ===== WINS DETECTION =====
        const wins: string[] = [];

        if (streak >= 10) {
            wins.push(`${streak}-day logging streak - exceptional consistency`);
        } else if (streak >= 7) {
            wins.push(`${streak}-day logging streak - solid week`);
        } else if (streak >= 3) {
            wins.push(`${streak}-day streak - momentum building`);
        }
        if (completionRate >= 80) {
            wins.push(`${completionRate}% task completion rate - crushing it`);
        } else if (completionRate >= 60) {
            wins.push(`${completionRate}% task completion - solid progress`);
        }
        if (tasksCompletedThisWeek >= 10) {
            wins.push(`${tasksCompletedThisWeek} tasks completed this week`);
        } else if (tasksCompletedThisWeek >= 5) {
            wins.push(`${tasksCompletedThisWeek} tasks completed this week`);
        }
        if (executedIdeas.length >= 10) {
            wins.push(`${executedIdeas.length} ideas brought to life`);
        } else if (executedIdeas.length >= 3) {
            wins.push(`${executedIdeas.length} ideas executed`);
        }
        if (disruptiveDiscoveries.length >= 3) {
            wins.push(`${disruptiveDiscoveries.length} disruptive discoveries captured`);
        }
        if (contacts.length >= 20) {
            wins.push(`${contacts.length} connections in your network`);
        }
        if (consistencyScore >= 80) {
            wins.push(`${consistencyScore}% consistency - excellent discipline`);
        }
        if (overdueTasks.length === 0 && pendingTasks.length > 0) {
            wins.push(`Zero overdue tasks - staying on top of things`);
        }

        return {
            systemStartDate: SYSTEM_START_DATE,
            daysSinceStart,
            // Daily logs
            streak,
            daysLoggedThisWeek,
            daysLoggedLast30,
            consistencyScore,
            daysSinceLastLog,
            totalLogs: dailyLogs.length,
            // Tasks
            pendingTasks: pendingTasks.length,
            completedTasks: completedTasks.length,
            overdueTasks: overdueTasks.length,
            tasksDueToday: tasksDueToday.length,
            tasksDueThisWeek: tasksDueThisWeek.length,
            inProgressTasks: inProgressTasks.length,
            tasksCompletedThisWeek,
            completionRate,
            tasksByPriority,
            // Ideas
            totalIdeas: ideas.length,
            executedIdeas: executedIdeas.length,
            pendingIdeas: pendingIdeas.length,
            highUrgencyPending: highUrgencyPending.length,
            contentIdeas: contentIdeas.length,
            xIdeas: xIdeas.length,
            linkedInIdeas: linkedInIdeas.length,
            ideaExecutionRate,
            ideasByCategory,
            oldestIdeaAge,
            // Discoveries
            totalDiscoveries: discoveries.length,
            disruptiveDiscoveries: disruptiveDiscoveries.length,
            exponentialDiscoveries: exponentialDiscoveries.length,
            linearDiscoveries: linearDiscoveries.length,
            // Contacts
            totalContacts: contacts.length,
            contactsThisMonth,
            // Weekly outcomes
            totalOutcomes: weeklyOutcomes.length,
            achievedOutcomes: achievedOutcomes.length,
            outcomeRate,
            // Gaps & Wins
            gaps,
            wins,
        };
    }, [dailyLogs, todos, ideas, discoveries, contacts, weeklyOutcomes, daysSinceStart]);

    // Calculate weekly breakdown
    const weeklyBreakdown = useMemo((): WeeklyStats[] => {
        const weeks: WeeklyStats[] = [];
        const today = new Date();
        const systemStart = new Date(SYSTEM_START_DATE);

        // Calculate how many weeks since system start
        const maxWeeks = Math.min(8, Math.ceil((today.getTime() - systemStart.getTime()) / (7 * 24 * 60 * 60 * 1000)));

        for (let i = 0; i < maxWeeks; i++) {
            const weekStart = getWeekStart(new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000));

            // Skip weeks before system start
            if (weekStart < systemStart) continue;

            const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
            const weekStartStr = formatDate(weekStart);
            const weekEndStr = formatDate(weekEnd);

            const weekDates = Array.from({ length: 7 }, (_, j) => {
                const d = new Date(weekStart);
                d.setDate(d.getDate() + j);
                return formatDate(d);
            }).filter(d => d >= SYSTEM_START_DATE);

            const daysLogged = weekDates.filter(d => dailyLogs.some(l => l.date === d)).length;

            const tasksCreated = todos.filter(t =>
                weekDates.includes(t.traceDate || '') || weekDates.includes(t.createdAt ? getLocalDate(new Date(t.createdAt)) : '')
            ).length;
            const tasksCompleted = todos.filter(t =>
                t.completed && (weekDates.includes(t.deadline) || weekDates.includes(t.traceDate || ''))
            ).length;

            const ideasAdded = ideas.filter(i =>
                weekDates.includes(i.date) || weekDates.includes(i.traceDate || '')
            ).length;
            const ideasExecuted = ideas.filter(i =>
                i.executed && (weekDates.includes(i.date) || weekDates.includes(i.traceDate || ''))
            ).length;

            const discoveriesAdded = discoveries.filter(d =>
                weekDates.includes(d.dateAdded) || weekDates.includes(d.traceDate || '')
            ).length;

            const contactsAdded = contacts.filter(c =>
                weekDates.includes(c.dateAdded) || weekDates.includes(c.traceDate || '')
            ).length;

            const weekOutcomes = weeklyOutcomes.filter(o =>
                weekDates.includes(o.traceDate || '') || weekDates.includes(o.weekStarting)
            );
            const outcomesAchieved = weekOutcomes.filter(o => o.achieved).length;

            weeks.push({
                weekLabel: getWeekLabel(weekStart),
                weekStart: weekStartStr,
                weekEnd: weekEndStr,
                daysLogged,
                tasksCreated,
                tasksCompleted,
                ideasAdded,
                ideasExecuted,
                discoveriesAdded,
                contactsAdded,
                outcomesAchieved,
                outcomesTotal: weekOutcomes.length,
            });
        }

        return weeks;
    }, [dailyLogs, todos, ideas, discoveries, contacts, weeklyOutcomes]);

    // Download report as JSON
    const downloadReport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            systemStartDate: SYSTEM_START_DATE,
            daysSinceStart,
            overallMetrics: {
                streak: metrics.streak,
                consistencyScore: metrics.consistencyScore,
                completionRate: metrics.completionRate,
                ideaExecutionRate: metrics.ideaExecutionRate,
                outcomeRate: metrics.outcomeRate,
            },
            tasks: {
                total: metrics.pendingTasks + metrics.completedTasks,
                pending: metrics.pendingTasks,
                completed: metrics.completedTasks,
                overdue: metrics.overdueTasks,
                inProgress: metrics.inProgressTasks,
                dueToday: metrics.tasksDueToday,
                dueThisWeek: metrics.tasksDueThisWeek,
                completedThisWeek: metrics.tasksCompletedThisWeek,
                byPriority: metrics.tasksByPriority,
            },
            ideas: {
                total: metrics.totalIdeas,
                executed: metrics.executedIdeas,
                pending: metrics.pendingIdeas,
                highUrgencyPending: metrics.highUrgencyPending,
                contentIdeas: metrics.contentIdeas,
                xIdeas: metrics.xIdeas,
                linkedInIdeas: metrics.linkedInIdeas,
                oldestPendingAgeDays: metrics.oldestIdeaAge,
                byCategory: metrics.ideasByCategory,
            },
            dailyLogs: {
                total: metrics.totalLogs,
                streak: metrics.streak,
                daysLoggedThisWeek: metrics.daysLoggedThisWeek,
                daysLoggedLast30: metrics.daysLoggedLast30,
                consistencyPercent: metrics.consistencyScore,
                daysSinceLastLog: metrics.daysSinceLastLog,
            },
            discoveries: {
                total: metrics.totalDiscoveries,
                disruptive: metrics.disruptiveDiscoveries,
                exponential: metrics.exponentialDiscoveries,
                linear: metrics.linearDiscoveries,
            },
            network: {
                totalContacts: metrics.totalContacts,
                addedThisMonth: metrics.contactsThisMonth,
            },
            weeklyOutcomes: {
                total: metrics.totalOutcomes,
                achieved: metrics.achievedOutcomes,
                achievementRate: metrics.outcomeRate,
            },
            weeklyBreakdown: weeklyBreakdown,
            gaps: metrics.gaps,
            wins: metrics.wins,
            aiInsight: aiInsight || null,
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aj-os-insights-${formatDate(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Generate AI insight
    const generateAIInsight = async () => {
        setAiLoading(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                setAiInsight('Gemini API key not configured. Add VITE_GEMINI_API_KEY to enable AI insights.');
                return;
            }

            const thisWeek = weeklyBreakdown[0];
            const lastWeek = weeklyBreakdown[1];

            const prompt = `You are a personal productivity coach analyzing a user's comprehensive data from their personal OS (started Jan 1, 2026). Be concise, actionable, and direct. No fluff.

OVERALL METRICS:
- Days since system start: ${daysSinceStart}
- Logging streak: ${metrics.streak} days
- 30-day consistency: ${metrics.consistencyScore}%
- Days since last log: ${metrics.daysSinceLastLog}
- Total logs: ${metrics.totalLogs}

TASKS:
- Pending: ${metrics.pendingTasks} (${metrics.tasksByPriority.Critical} critical, ${metrics.tasksByPriority.High} high)
- Completed: ${metrics.completedTasks}
- Overdue: ${metrics.overdueTasks}
- In Progress: ${metrics.inProgressTasks}
- Completion rate (30d): ${metrics.completionRate}%

IDEAS:
- Total: ${metrics.totalIdeas}
- Executed: ${metrics.executedIdeas} (${metrics.ideaExecutionRate}%)
- High-urgency pending: ${metrics.highUrgencyPending}
- Content ideas: ${metrics.contentIdeas} (X: ${metrics.xIdeas}, LinkedIn: ${metrics.linkedInIdeas})
- Oldest pending idea: ${metrics.oldestIdeaAge} days old

OTHER:
- Discoveries: ${metrics.totalDiscoveries} (${metrics.disruptiveDiscoveries} disruptive)
- Network size: ${metrics.totalContacts}
- Target outcome rate: ${metrics.outcomeRate}%

THIS WEEK vs LAST WEEK:
- Logs: ${thisWeek?.daysLogged || 0}/7 vs ${lastWeek?.daysLogged || 0}/7
- Tasks completed: ${thisWeek?.tasksCompleted || 0} vs ${lastWeek?.tasksCompleted || 0}
- Ideas added: ${thisWeek?.ideasAdded || 0} vs ${lastWeek?.ideasAdded || 0}

DETECTED GAPS: ${metrics.gaps.length > 0 ? metrics.gaps.join('; ') : 'None'}
DETECTED WINS: ${metrics.wins.length > 0 ? metrics.wins.join('; ') : 'Keep pushing'}

Based on ALL this data, provide:
1. One key pattern you notice about their productivity (positive or concerning)
2. One specific, actionable recommendation for the coming week
3. One insight about their system usage they might not realize

Format: 3 bullet points. Be specific to THEIR data. Direct tone, no emojis.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
                    }),
                }
            );

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate insight.';
            setAiInsight(text);
        } catch (error) {
            setAiInsight('Failed to generate insight. Check your connection.');
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                    <span className="text-zinc-500 mono text-sm uppercase tracking-widest font-black">Analyzing your data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-slide-up pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="h-[1px] w-10 bg-gradient-to-r from-sky-500 to-transparent"></div>
                        <span className="text-[10px] font-black mono uppercase tracking-[0.4em] text-zinc-500">Operation: Self-Analysis</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter text-main font-heading uppercase">INSIGHTS</h2>
                    <p className="text-zinc-500 mt-4 max-w-lg leading-relaxed font-medium">
                        Your complete data profile since {SYSTEM_START_DATE}. Day {daysSinceStart} of AJ OS.
                    </p>
                </div>

                <button
                    onClick={downloadReport}
                    className="flex items-center space-x-3 px-6 py-4 rounded-2xl font-black text-sm transition-all bg-white text-black hover:bg-slate-200 shadow-2xl active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="uppercase tracking-widest text-[10px]">Download Report</span>
                </button>
            </header>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`glass-card p-5 rounded-2xl border ${metrics.streak > 0 ? 'border-emerald-500/20' : 'border-zinc-100'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500">Streak</span>
                    </div>
                    <p className={`text-3xl font-black ${metrics.streak > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>{metrics.streak}</p>
                    <p className="text-[10px] text-zinc-600 mt-1 font-medium">days consecutive</p>
                </div>

                <div className={`glass-card p-5 rounded-2xl border ${metrics.completionRate >= 70 ? 'border-sky-500/20' : 'border-zinc-100'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500">Task Rate</span>
                    </div>
                    <p className={`text-3xl font-black ${metrics.completionRate >= 70 ? 'text-sky-400' : metrics.completionRate >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.completionRate}%</p>
                    <p className="text-[10px] text-zinc-600 mt-1 font-medium">30-day completion</p>
                </div>

                <div className={`glass-card p-5 rounded-2xl border ${metrics.consistencyScore >= 70 ? 'border-purple-500/20' : 'border-zinc-100'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500">Consistency</span>
                    </div>
                    <p className={`text-3xl font-black ${metrics.consistencyScore >= 70 ? 'text-purple-400' : metrics.consistencyScore >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.consistencyScore}%</p>
                    <p className="text-[10px] text-zinc-600 mt-1 font-medium">30-day logging</p>
                </div>

                <div className={`glass-card p-5 rounded-2xl border ${metrics.overdueTasks > 0 ? 'border-rose-500/30 bg-rose-500/5' : 'border-emerald-500/20'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black mono uppercase tracking-widest text-zinc-500">Overdue</span>
                    </div>
                    <p className={`text-3xl font-black ${metrics.overdueTasks > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{metrics.overdueTasks}</p>
                    <p className="text-[10px] text-zinc-600 mt-1 font-medium">{metrics.overdueTasks === 0 ? 'all clear' : 'need attention'}</p>
                </div>
            </div>

            {/* Attention & Wins */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-rose-500/10">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-black text-main uppercase tracking-widest">Needs Attention</h3>
                    </div>

                    {metrics.gaps.length === 0 ? (
                        <p className="text-sm text-emerald-500 font-medium">Looking good. No gaps detected.</p>
                    ) : (
                        <ul className="space-y-3">
                            {metrics.gaps.slice(0, 5).map((gap, i) => (
                                <li key={i} className="flex items-start space-x-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0"></div>
                                    <span className="text-sm text-zinc-400 font-medium">{gap}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="glass-card p-6 rounded-2xl border border-emerald-500/10">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-black text-main uppercase tracking-widest">Your Wins</h3>
                    </div>

                    {metrics.wins.length === 0 ? (
                        <p className="text-sm text-zinc-500 font-medium">Keep pushing. Your wins will show here.</p>
                    ) : (
                        <ul className="space-y-3">
                            {metrics.wins.slice(0, 5).map((win, i) => (
                                <li key={i} className="flex items-start space-x-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                                    <span className="text-sm text-zinc-300 font-medium">{win}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-100">
                <h3 className="text-sm font-black text-main uppercase tracking-widest mb-6">Weekly Breakdown</h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100">
                                <th className="text-left py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Week</th>
                                <th className="text-center py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Logs</th>
                                <th className="text-center py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tasks</th>
                                <th className="text-center py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ideas</th>
                                <th className="text-center py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Disc.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {weeklyBreakdown.map((week, i) => (
                                <tr key={i} className={`border-b border-zinc-100 ${i === 0 ? 'bg-sky-500/5' : ''}`}>
                                    <td className="py-3">
                                        <span className={`font-bold ${i === 0 ? 'text-sky-400' : 'text-zinc-400'}`}>{week.weekLabel}</span>
                                        <p className="text-[10px] text-zinc-600 mono">{week.weekStart}</p>
                                    </td>
                                    <td className="text-center py-3">
                                        <span className={`font-black ${week.daysLogged >= 5 ? 'text-emerald-400' : week.daysLogged >= 3 ? 'text-amber-400' : 'text-zinc-500'}`}>
                                            {week.daysLogged}/7
                                        </span>
                                    </td>
                                    <td className="text-center py-3">
                                        <span className="font-black text-sky-400">{week.tasksCompleted}</span>
                                        <span className="text-zinc-600 text-xs">/{week.tasksCreated}</span>
                                    </td>
                                    <td className="text-center py-3">
                                        <span className="font-black text-purple-400">{week.ideasExecuted}</span>
                                        <span className="text-zinc-600 text-xs">/{week.ideasAdded}</span>
                                    </td>
                                    <td className="text-center py-3">
                                        <span className="font-black text-teal-400">{week.discoveriesAdded}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-zinc-100">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Task Breakdown</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Pending</span>
                            <span className="font-black text-amber-400">{metrics.pendingTasks}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">In Progress</span>
                            <span className="font-black text-sky-400">{metrics.inProgressTasks}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Due Today</span>
                            <span className="font-black text-rose-400">{metrics.tasksDueToday}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">This Week</span>
                            <span className="font-black text-purple-400">{metrics.tasksDueThisWeek}</span>
                        </div>
                        <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Total Completed</span>
                            <span className="font-black text-emerald-400">{metrics.completedTasks}</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-zinc-100">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Idea Breakdown</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Content Ideas</span>
                            <span className="font-black text-purple-400">{metrics.contentIdeas}</span>
                        </div>
                        <div className="flex justify-between items-center pl-3">
                            <span className="text-xs text-zinc-500">For X</span>
                            <span className="font-bold text-zinc-400">{metrics.xIdeas}</span>
                        </div>
                        <div className="flex justify-between items-center pl-3">
                            <span className="text-xs text-zinc-500">For LinkedIn</span>
                            <span className="font-bold text-zinc-400">{metrics.linkedInIdeas}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">High Urgency</span>
                            <span className="font-black text-rose-400">{metrics.highUrgencyPending}</span>
                        </div>
                        <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Execution Rate</span>
                            <span className="font-black text-sky-400">{metrics.ideaExecutionRate}%</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-zinc-100">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">System Health</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Total Logs</span>
                            <span className="font-black text-sky-400">{metrics.totalLogs}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Discoveries</span>
                            <span className="font-black text-teal-400">{metrics.totalDiscoveries}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Network Size</span>
                            <span className="font-black text-indigo-400">{metrics.totalContacts}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Target Outcomes</span>
                            <span className="font-black text-amber-400">{metrics.achievedOutcomes}/{metrics.totalOutcomes}</span>
                        </div>
                        <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Outcome Rate</span>
                            <span className="font-black text-emerald-400">{metrics.outcomeRate}%</span>
                        </div>
                    </div>
                </div>
            </div>



            {/* Data Summary Footer */}
            <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-zinc-100">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                    <span className="text-[10px] text-zinc-500 font-bold mono uppercase">{metrics.totalLogs} Logs</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-[10px] text-zinc-500 font-bold mono uppercase">{metrics.completedTasks + metrics.pendingTasks} Tasks</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-[10px] text-zinc-500 font-bold mono uppercase">{metrics.totalIdeas} Ideas</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                    <span className="text-[10px] text-zinc-500 font-bold mono uppercase">{metrics.totalDiscoveries} Discoveries</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-[10px] text-zinc-500 font-bold mono uppercase">{metrics.totalContacts} Contacts</span>
                </div>
            </div>
        </div>
    );
};

export default Insights;
