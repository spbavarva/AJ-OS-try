

import { supabase, isSupabaseConfigured } from './supabase';
import { DailyEntry, Idea, WeeklyOutcome, Todo, DecisionGate, Contact, Discovery, Expense } from './types';
import { sanitizeText, sanitizeUrl, sanitizeEmail, rateLimiter } from './security';
import { getLocalDate } from './date';

// Local cache keys for offline support
const CACHE_KEYS = {
  DAILY: 'aj26_daily_logs',
  IDEAS: 'aj26_ideas',
  WEEKLY: 'aj26_weekly_engine',
  TODOS: 'aj26_todos',
  DECISIONS: 'aj26_decisions',
  CONTACTS: 'aj26_contacts',
  DISCOVERIES: 'aj26_discoveries',
  EXPENSES: 'aj26_expenses',
};

// Helper to update local cache securely
const updateCache = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to update cache:', e);
  }
};

// Helper to get from cache safely
const getCache = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Security: Check rate limit before database operations
const checkRateLimit = (): boolean => {
  if (!rateLimiter.canMakeRequest()) {
    console.warn('Rate limit exceeded. Please wait before making more requests.');
    return false;
  }
  return true;
};

// Security: Validate Supabase is configured
const ensureConfigured = (): boolean => {
  if (!isSupabaseConfigured()) {
    console.error('Supabase not configured. Please set up environment variables in .env.local');
    return false;
  }
  return true;
};

// ==================== STORAGE ENGINE ====================
export const Storage = {
  // ==================== DAILY ENTRIES ====================
  getDailyEntries: (): DailyEntry[] => getCache<DailyEntry>(CACHE_KEYS.DAILY),

  fetchDailyEntries: async (): Promise<DailyEntry[]> => {
    if (!ensureConfigured()) return getCache<DailyEntry>(CACHE_KEYS.DAILY);

    // Try fetching with new columns first
    let { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .order('pinned', { ascending: false })
      .order('position', { ascending: true })
      .order('trace_date', { ascending: false });

    // Fallback: If error (likely missing columns), try legacy fetch
    if (error) {
      console.warn('Fetching with pinned/position failed, falling back to legacy sort:', error.message);
      const legacyResult = await supabase
        .from('daily_entries')
        .select('*')
        .order('trace_date', { ascending: false });

      data = legacyResult.data;
      error = legacyResult.error;
    }

    if (error) {
      console.error('Error fetching daily entries:', error);
      return getCache<DailyEntry>(CACHE_KEYS.DAILY);
    }

    const entries: DailyEntry[] = (data || []).map(row => ({
      id: row.id,
      date: row.date,
      workedOn: row.worked_on,
      shipped: row.shipped,
      traceDate: row.trace_date || row.date,
      pinned: row.pinned || false,
      position: row.position || 0,
    }));

    updateCache(CACHE_KEYS.DAILY, entries);
    return entries;
  },

  saveDailyEntry: async (entry: DailyEntry): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const traceDate = entry.traceDate || getLocalDate();
    const sanitizedEntry: DailyEntry = {
      ...entry,
      workedOn: sanitizeText(entry.workedOn),
      shipped: sanitizeText(entry.shipped),
      traceDate: traceDate,
    };

    const previousCache = Storage.getDailyEntries();
    updateCache(CACHE_KEYS.DAILY, [sanitizedEntry, ...previousCache]);

    // Try insert including new columns
    const { error } = await supabase.from('daily_entries').insert({
      id: sanitizedEntry.id,
      date: sanitizedEntry.date,
      worked_on: sanitizedEntry.workedOn,
      shipped: sanitizedEntry.shipped,
      trace_date: sanitizedEntry.traceDate,
      pinned: sanitizedEntry.pinned || false,
      position: sanitizedEntry.position || 0,
    });

    if (error) {
      // Fallback: Try insert without new columns if it failed
      console.warn('Insert with pinned/position failed, retrying legacy insert:', error.message);
      const { error: retryError } = await supabase.from('daily_entries').insert({
        id: sanitizedEntry.id,
        date: sanitizedEntry.date,
        worked_on: sanitizedEntry.workedOn,
        shipped: sanitizedEntry.shipped,
        trace_date: sanitizedEntry.traceDate,
      });

      if (retryError) {
        console.error('Error saving daily entry (retry failed):', retryError);
        updateCache(CACHE_KEYS.DAILY, previousCache); // Revert cache on confirmed failure
      }
    }
  },

  updateDailyEntry: async (updatedEntry: DailyEntry): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getDailyEntries();
    const updatedCache = previousCache.map(e => e.id === updatedEntry.id ? updatedEntry : e);
    updateCache(CACHE_KEYS.DAILY, updatedCache);

    // Try update with new columns
    const { error } = await supabase.from('daily_entries')
      .update({
        date: updatedEntry.date,
        worked_on: sanitizeText(updatedEntry.workedOn),
        shipped: sanitizeText(updatedEntry.shipped),
        trace_date: updatedEntry.traceDate,
        pinned: updatedEntry.pinned || false,
        position: updatedEntry.position || 0,
      })
      .eq('id', updatedEntry.id);

    if (error) {
      // Fallback: Legacy update
      console.warn('Update with pinned/position failed, retrying legacy update:', error.message);
      const { error: retryError } = await supabase.from('daily_entries')
        .update({
          date: updatedEntry.date,
          worked_on: sanitizeText(updatedEntry.workedOn),
          shipped: sanitizeText(updatedEntry.shipped),
          trace_date: updatedEntry.traceDate,
        })
        .eq('id', updatedEntry.id);

      if (retryError) {
        console.error('Error updating daily entry:', retryError);
        updateCache(CACHE_KEYS.DAILY, previousCache);
      }
    }
  },

  deleteDailyEntry: async (id: string): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getDailyEntries();
    updateCache(CACHE_KEYS.DAILY, previousCache.filter(e => e.id !== id));

    const { error } = await supabase.from('daily_entries').delete().eq('id', id);
    if (error) {
      console.error('Error deleting daily entry:', error);
      updateCache(CACHE_KEYS.DAILY, previousCache);
    }
  },

  // ==================== IDEAS ====================
  getIdeas: (): Idea[] => getCache<Idea>(CACHE_KEYS.IDEAS),

  fetchIdeas: async (): Promise<Idea[]> => {
    if (!ensureConfigured()) return getCache<Idea>(CACHE_KEYS.IDEAS);

    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('trace_date', { ascending: false });

      if (error) {
        console.error('Error fetching ideas:', error);
        return getCache<Idea>(CACHE_KEYS.IDEAS);
      }

      const ideas: Idea[] = (data || []).map(row => ({
        id: row.id,
        date: row.date,
        thought: row.thought,
        category: row.category,
        urgency: row.urgency,
        status: row.status,
        platform: row.platform,
        executed: row.executed || false,
        pinned: row.pinned || false,
        traceDate: row.trace_date || row.date,
      }));

      // Merge with any local items that might not have synced yet
      // For now, we trust the DB as source of truth but update cache
      updateCache(CACHE_KEYS.IDEAS, ideas);
      return ideas;
    } catch (e) {
      console.error('Unexpected error fetching ideas:', e);
      return getCache<Idea>(CACHE_KEYS.IDEAS);
    }
  },

  saveIdea: async (idea: Idea): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const traceDate = idea.traceDate || getLocalDate();
    const sanitizedIdea: Idea = {
      ...idea,
      thought: sanitizeText(idea.thought),
      traceDate: traceDate,
    };

    const previousCache = Storage.getIdeas();
    updateCache(CACHE_KEYS.IDEAS, [sanitizedIdea, ...previousCache]);

    const { error } = await supabase.from('ideas').insert({
      id: sanitizedIdea.id,
      date: sanitizedIdea.date,
      thought: sanitizedIdea.thought,
      category: sanitizedIdea.category,
      urgency: sanitizedIdea.urgency,
      status: sanitizedIdea.status,
      platform: sanitizedIdea.platform,
      executed: sanitizedIdea.executed || false,
      pinned: sanitizedIdea.pinned || false,
      trace_date: sanitizedIdea.traceDate,
    });

    if (error) {
      console.error('Error saving idea to Supabase:', error, sanitizedIdea);
      updateCache(CACHE_KEYS.IDEAS, previousCache);
    }
  },

  updateIdea: async (updatedIdea: Idea): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getIdeas();
    const updatedCache = previousCache.map(i => i.id === updatedIdea.id ? updatedIdea : i);
    updateCache(CACHE_KEYS.IDEAS, updatedCache);

    const { error } = await supabase.from('ideas')
      .update({
        date: updatedIdea.date,
        thought: sanitizeText(updatedIdea.thought),
        category: updatedIdea.category,
        urgency: updatedIdea.urgency,
        status: updatedIdea.status,
        platform: updatedIdea.platform,
        executed: updatedIdea.executed || false,
        pinned: updatedIdea.pinned || false,
        trace_date: updatedIdea.traceDate,
      })
      .eq('id', updatedIdea.id);

    if (error) {
      console.error('Error updating idea in Supabase:', error, updatedIdea);
      updateCache(CACHE_KEYS.IDEAS, previousCache);
    }
  },

  deleteIdea: async (id: string): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getIdeas();
    updateCache(CACHE_KEYS.IDEAS, previousCache.filter(i => i.id !== id));

    const { error } = await supabase.from('ideas').delete().eq('id', id);
    if (error) {
      console.error('Error deleting idea:', error);
      updateCache(CACHE_KEYS.IDEAS, previousCache);
    }
  },

  // ==================== WEEKLY OUTCOMES ====================
  getWeeklyOutcomes: (): WeeklyOutcome[] => getCache<WeeklyOutcome>(CACHE_KEYS.WEEKLY),

  fetchWeeklyOutcomes: async (): Promise<WeeklyOutcome[]> => {
    if (!ensureConfigured()) return getCache<WeeklyOutcome>(CACHE_KEYS.WEEKLY);

    const { data, error } = await supabase
      .from('weekly_outcomes')
      .select('*')
      .order('trace_date', { ascending: false });

    if (error) {
      console.error('Error fetching weekly outcomes:', error);
      return getCache<WeeklyOutcome>(CACHE_KEYS.WEEKLY);
    }

    const outcomes: WeeklyOutcome[] = (data || []).map(row => ({
      id: row.id,
      weekStarting: row.week_starting,
      build: row.build,
      ship: row.ship,
      learn: row.learn,
      status: row.status,
      reviewGenerated: row.review_generated,
      traceDate: row.trace_date || row.week_starting,
    }));

    updateCache(CACHE_KEYS.WEEKLY, outcomes);
    return outcomes;
  },

  saveWeeklyOutcome: async (outcome: WeeklyOutcome): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const traceDate = outcome.traceDate || getLocalDate();
    const sanitizedOutcome: WeeklyOutcome = {
      ...outcome,
      build: sanitizeText(outcome.build),
      ship: sanitizeText(outcome.ship),
      learn: sanitizeText(outcome.learn),
      traceDate: traceDate,
    };

    const previousCache = Storage.getWeeklyOutcomes();
    updateCache(CACHE_KEYS.WEEKLY, [sanitizedOutcome, ...previousCache]);

    const { error } = await supabase.from('weekly_outcomes').insert({
      id: sanitizedOutcome.id,
      week_starting: sanitizedOutcome.weekStarting,
      build: sanitizedOutcome.build,
      ship: sanitizedOutcome.ship,
      learn: sanitizedOutcome.learn,
      status: sanitizedOutcome.status,
      review_generated: sanitizedOutcome.reviewGenerated || false,
      trace_date: sanitizedOutcome.traceDate,
    });

    if (error) {
      console.error('Error saving weekly outcome:', error);
      updateCache(CACHE_KEYS.WEEKLY, previousCache);
    }
  },

  updateWeeklyOutcome: async (updated: WeeklyOutcome): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getWeeklyOutcomes();
    const updatedCache = previousCache.map(o => o.id === updated.id ? updated : o);
    updateCache(CACHE_KEYS.WEEKLY, updatedCache);

    const { error } = await supabase.from('weekly_outcomes')
      .update({
        week_starting: updated.weekStarting,
        build: sanitizeText(updated.build),
        ship: sanitizeText(updated.ship),
        learn: sanitizeText(updated.learn),
        status: updated.status,
        review_generated: updated.reviewGenerated,
        trace_date: updated.traceDate,
      })
      .eq('id', updated.id);

    if (error) {
      console.error('Error updating weekly outcome:', error);
      updateCache(CACHE_KEYS.WEEKLY, previousCache);
    }
  },

  deleteWeeklyOutcome: async (id: string): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getWeeklyOutcomes();
    updateCache(CACHE_KEYS.WEEKLY, previousCache.filter(o => o.id !== id));

    const { error } = await supabase.from('weekly_outcomes').delete().eq('id', id);
    if (error) {
      console.error('Error deleting weekly outcome:', error);
      updateCache(CACHE_KEYS.WEEKLY, previousCache);
    }
  },

  // ==================== TODOS ====================
  getTodos: (): Todo[] => getCache<Todo>(CACHE_KEYS.TODOS),

  fetchTodos: async (): Promise<Todo[]> => {
    if (!ensureConfigured()) return getCache<Todo>(CACHE_KEYS.TODOS);

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('deadline', { ascending: true });

    if (error) {
      console.error('Error fetching todos:', error);
      return getCache<Todo>(CACHE_KEYS.TODOS);
    }

    const todos: Todo[] = (data || []).map(row => ({
      id: row.id,
      title: row.title,
      details: row.details,
      deadline: row.deadline,
      priority: row.priority,
      status: row.status,
      completed: row.completed,
      createdAt: row.created_at,
      traceDate: row.trace_date || (row.created_at ? getLocalDate(new Date(row.created_at)) : getLocalDate()),
      timeSlot: row.time_slot,
      targetTime: row.target_time,
      pinned: row.pinned || false,
      completedAt: row.completed_at,
    }));

    updateCache(CACHE_KEYS.TODOS, todos);
    return todos;
  },

  saveTodo: async (todo: Todo): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const traceDate = todo.traceDate || getLocalDate();
    const sanitizedTodo: Todo = {
      ...todo,
      title: sanitizeText(todo.title),
      details: sanitizeText(todo.details),
      traceDate: traceDate,
    };

    const previousCache = Storage.getTodos();
    updateCache(CACHE_KEYS.TODOS, [sanitizedTodo, ...previousCache]);

    const { error } = await supabase.from('todos').insert({
      id: sanitizedTodo.id,
      title: sanitizedTodo.title,
      details: sanitizedTodo.details,
      deadline: sanitizedTodo.deadline,
      priority: sanitizedTodo.priority,
      status: sanitizedTodo.status,
      completed: sanitizedTodo.completed,
      created_at: sanitizedTodo.createdAt,
      trace_date: sanitizedTodo.traceDate,
      time_slot: sanitizedTodo.timeSlot,
      target_time: sanitizedTodo.targetTime,
      pinned: sanitizedTodo.pinned || false,
      completed_at: sanitizedTodo.completedAt,
    });

    if (error) {
      console.error('Error saving todo:', error);
      updateCache(CACHE_KEYS.TODOS, previousCache);
    }
  },

  updateTodo: async (updated: Todo): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getTodos();
    const updatedCache = previousCache.map(t => t.id === updated.id ? updated : t);
    updateCache(CACHE_KEYS.TODOS, updatedCache);

    const { error } = await supabase.from('todos')
      .update({
        title: sanitizeText(updated.title),
        details: sanitizeText(updated.details),
        deadline: updated.deadline,
        priority: updated.priority,
        status: updated.status,
        completed: updated.completed,
        trace_date: updated.traceDate,
        time_slot: updated.timeSlot,
        target_time: updated.targetTime,
        pinned: updated.pinned || false,
        completed_at: updated.completedAt,
      })
      .eq('id', updated.id);

    if (error) {
      console.error('Error updating todo:', error);
      updateCache(CACHE_KEYS.TODOS, previousCache);
    }
  },

  deleteTodo: async (id: string): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getTodos();
    updateCache(CACHE_KEYS.TODOS, previousCache.filter(t => t.id !== id));

    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) {
      console.error('Error deleting todo:', error);
      updateCache(CACHE_KEYS.TODOS, previousCache);
    }
  },

  // ==================== DECISIONS ====================
  getDecisions: (): DecisionGate[] => getCache<DecisionGate>(CACHE_KEYS.DECISIONS),

  fetchDecisions: async (): Promise<DecisionGate[]> => {
    if (!ensureConfigured()) return getCache<DecisionGate>(CACHE_KEYS.DECISIONS);

    const { data, error } = await supabase
      .from('decision_gates')
      .select('*')
      .order('trace_date', { ascending: false });

    if (error) {
      console.error('Error fetching decisions:', error);
      return getCache<DecisionGate>(CACHE_KEYS.DECISIONS);
    }

    const decisions: DecisionGate[] = (data || []).map(row => ({
      id: row.id,
      date: row.date,
      decision: row.decision || row.project_title,
      outcome: row.status === 'Decided' ? (row.outcome || row.result) : (row.outcome || ''),
      status: row.status || (row.result === 'Approved' ? 'Decided' : 'Pending'),
      traceDate: row.trace_date || row.date,
    }));

    updateCache(CACHE_KEYS.DECISIONS, decisions);
    return decisions;
  },

  saveDecision: async (decision: DecisionGate): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const traceDate = decision.traceDate || getLocalDate();
    const sanitizedDecision: DecisionGate = {
      ...decision,
      decision: sanitizeText(decision.decision),
      outcome: sanitizeText(decision.outcome),
      traceDate: traceDate,
    };

    const previousCache = Storage.getDecisions();
    updateCache(CACHE_KEYS.DECISIONS, [sanitizedDecision, ...previousCache]);

    const { error } = await supabase.from('decision_gates').insert({
      id: sanitizedDecision.id,
      date: sanitizedDecision.date,
      decision: sanitizedDecision.decision,
      outcome: sanitizedDecision.outcome,
      status: sanitizedDecision.status,
      trace_date: sanitizedDecision.traceDate,
    });

    if (error) {
      console.error('Error saving decision:', error);
      updateCache(CACHE_KEYS.DECISIONS, previousCache);
    }
  },

  updateDecision: async (updated: DecisionGate): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getDecisions();
    const updatedCache = previousCache.map(d => d.id === updated.id ? updated : d);
    updateCache(CACHE_KEYS.DECISIONS, updatedCache);

    const { error } = await supabase.from('decision_gates')
      .update({
        decision: sanitizeText(updated.decision),
        outcome: sanitizeText(updated.outcome),
        status: updated.status,
        trace_date: updated.traceDate,
      })
      .eq('id', updated.id);

    if (error) {
      console.error('Error updating decision:', error);
      updateCache(CACHE_KEYS.DECISIONS, previousCache);
    }
  },

  deleteDecision: async (id: string): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getDecisions();
    updateCache(CACHE_KEYS.DECISIONS, previousCache.filter(d => d.id !== id));

    const { error } = await supabase.from('decision_gates').delete().eq('id', id);
    if (error) {
      console.error('Error deleting decision:', error);
      updateCache(CACHE_KEYS.DECISIONS, previousCache);
    }
  },

  // ==================== CONTACTS ====================
  getContacts: (): Contact[] => getCache<Contact>(CACHE_KEYS.CONTACTS),

  fetchContacts: async (): Promise<Contact[]> => {
    if (!ensureConfigured()) return getCache<Contact>(CACHE_KEYS.CONTACTS);

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('trace_date', { ascending: false });

    if (error) {
      console.error('Error fetching contacts:', error);
      return getCache<Contact>(CACHE_KEYS.CONTACTS);
    }

    const contacts: Contact[] = (data || []).map(row => ({
      id: row.id,
      name: row.name,
      company: row.company,
      email: row.email,
      linkedin: row.linkedin,
      xAccount: row.x_account,
      notes: row.notes,
      dateAdded: row.date_added,
      traceDate: row.trace_date || row.date_added,
      avatarUrl: row.avatar_url,
    }));

    updateCache(CACHE_KEYS.CONTACTS, contacts);
    return contacts;
  },

  saveContact: async (contact: Contact): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const traceDate = contact.traceDate || getLocalDate();
    const sanitizedContact: Contact = {
      ...contact,
      name: sanitizeText(contact.name),
      company: sanitizeText(contact.company),
      email: sanitizeEmail(contact.email),
      linkedin: sanitizeUrl(contact.linkedin),
      xAccount: sanitizeText(contact.xAccount),
      notes: sanitizeText(contact.notes),
      traceDate: traceDate,
      avatarUrl: sanitizeUrl(contact.avatarUrl || ''),
    };

    const previousCache = Storage.getContacts();
    updateCache(CACHE_KEYS.CONTACTS, [sanitizedContact, ...previousCache]);

    const { error } = await supabase.from('contacts').insert({
      id: sanitizedContact.id,
      name: sanitizedContact.name,
      company: sanitizedContact.company,
      email: sanitizedContact.email,
      linkedin: sanitizedContact.linkedin,
      x_account: sanitizedContact.xAccount,
      notes: sanitizedContact.notes,
      date_added: sanitizedContact.dateAdded,
      trace_date: sanitizedContact.traceDate,
      avatar_url: sanitizedContact.avatarUrl,
    });

    if (error) {
      console.error('Error saving contact:', error);
      updateCache(CACHE_KEYS.CONTACTS, previousCache);
    }
  },

  updateContact: async (updated: Contact): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getContacts();
    const updatedCache = previousCache.map(c => c.id === updated.id ? updated : c);
    updateCache(CACHE_KEYS.CONTACTS, updatedCache);

    const { error } = await supabase.from('contacts')
      .update({
        name: sanitizeText(updated.name),
        company: sanitizeText(updated.company),
        email: sanitizeEmail(updated.email),
        linkedin: sanitizeUrl(updated.linkedin),
        x_account: updated.xAccount,
        notes: sanitizeText(updated.notes),
        date_added: updated.dateAdded,
        trace_date: updated.traceDate,
        avatar_url: updated.avatarUrl,
      })
      .eq('id', updated.id);

    if (error) {
      console.error('Error updating contact:', error);
      updateCache(CACHE_KEYS.CONTACTS, previousCache);
    }
  },

  deleteContact: async (id: string): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getContacts();
    updateCache(CACHE_KEYS.CONTACTS, previousCache.filter(c => c.id !== id));

    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting contact:', error);
      updateCache(CACHE_KEYS.CONTACTS, previousCache);
    }
  },

  // ==================== DISCOVERIES ====================
  getDiscoveries: (): Discovery[] => getCache<Discovery>(CACHE_KEYS.DISCOVERIES),

  fetchDiscoveries: async (): Promise<Discovery[]> => {
    if (!ensureConfigured()) return getCache<Discovery>(CACHE_KEYS.DISCOVERIES);

    const { data, error } = await supabase
      .from('discoveries')
      .select('*')
      .order('trace_date', { ascending: false });

    if (error) {
      console.error('Error fetching discoveries:', error);
      return getCache<Discovery>(CACHE_KEYS.DISCOVERIES);
    }

    const discoveries: Discovery[] = (data || []).map(row => ({
      id: row.id,
      title: row.title,
      url: row.url,
      description: row.description,
      category: row.category,
      impact: row.impact || 'Linear',
      dateAdded: row.date_added,
      traceDate: row.trace_date || row.date_added,
      pinned: row.pinned || false,
    }));

    updateCache(CACHE_KEYS.DISCOVERIES, discoveries);
    return discoveries;
  },

  saveDiscovery: async (discovery: Discovery): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const traceDate = discovery.traceDate || getLocalDate();
    const sanitizedDiscovery: Discovery = {
      ...discovery,
      title: sanitizeText(discovery.title),
      url: sanitizeUrl(discovery.url),
      description: sanitizeText(discovery.description),
      category: sanitizeText(discovery.category),
      traceDate: traceDate,
    };

    const previousCache = Storage.getDiscoveries();
    updateCache(CACHE_KEYS.DISCOVERIES, [sanitizedDiscovery, ...previousCache]);

    const { error } = await supabase.from('discoveries').insert({
      id: sanitizedDiscovery.id,
      title: sanitizedDiscovery.title,
      url: sanitizedDiscovery.url,
      description: sanitizedDiscovery.description,
      category: sanitizedDiscovery.category,
      impact: sanitizedDiscovery.impact,
      date_added: sanitizedDiscovery.dateAdded,
      trace_date: sanitizedDiscovery.traceDate,
      pinned: sanitizedDiscovery.pinned || false,
    });

    if (error) {
      console.error('Error saving discovery:', error);
      updateCache(CACHE_KEYS.DISCOVERIES, previousCache);
    }
  },

  updateDiscovery: async (updated: Discovery): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getDiscoveries();
    const updatedCache = previousCache.map(d => d.id === updated.id ? updated : d);
    updateCache(CACHE_KEYS.DISCOVERIES, updatedCache);

    const { error } = await supabase.from('discoveries')
      .update({
        title: sanitizeText(updated.title),
        url: sanitizeUrl(updated.url),
        description: sanitizeText(updated.description),
        category: sanitizeText(updated.category),
        impact: updated.impact,
        date_added: updated.dateAdded,
        trace_date: updated.traceDate,
        pinned: updated.pinned || false,
      })
      .eq('id', updated.id);

    if (error) {
      console.error('Error updating discovery:', error);
      updateCache(CACHE_KEYS.DISCOVERIES, previousCache);
    }
  },

  deleteDiscovery: async (id: string): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getDiscoveries();
    updateCache(CACHE_KEYS.DISCOVERIES, previousCache.filter(d => d.id !== id));

    const { error } = await supabase.from('discoveries').delete().eq('id', id);
    if (error) {
      console.error('Error deleting discovery:', error);
      updateCache(CACHE_KEYS.DISCOVERIES, previousCache);
    }
  },

  // ==================== EXPENSES ====================
  getExpenses: (): Expense[] => getCache<Expense>(CACHE_KEYS.EXPENSES),

  fetchExpenses: async (): Promise<Expense[]> => {
    if (!ensureConfigured()) return getCache<Expense>(CACHE_KEYS.EXPENSES);

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      return getCache<Expense>(CACHE_KEYS.EXPENSES);
    }

    const expenses: Expense[] = (data || []).map(row => ({
      id: row.id,
      title: row.title,
      amount: Number(row.amount),
      category: row.category,
      date: row.date,
      createdAt: row.created_at,
      traceDate: row.trace_date || row.date,
    }));

    updateCache(CACHE_KEYS.EXPENSES, expenses);
    return expenses;
  },

  saveExpense: async (expense: Expense): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const traceDate = expense.traceDate || new Date().toISOString().split('T')[0];
    const sanitizedExpense: Expense = {
      ...expense,
      title: sanitizeText(expense.title),
      traceDate: traceDate,
    };

    const previousCache = Storage.getExpenses();
    updateCache(CACHE_KEYS.EXPENSES, [sanitizedExpense, ...previousCache]);

    const { error } = await supabase.from('expenses').insert({
      id: sanitizedExpense.id,
      title: sanitizedExpense.title,
      amount: sanitizedExpense.amount,
      category: sanitizedExpense.category,
      date: sanitizedExpense.date,
      created_at: sanitizedExpense.createdAt,
      trace_date: sanitizedExpense.traceDate,
    });

    if (error) {
      console.error('Error saving expense:', error);
      updateCache(CACHE_KEYS.EXPENSES, previousCache);
    }
  },

  deleteExpense: async (id: string): Promise<void> => {
    if (!checkRateLimit() || !ensureConfigured()) return;

    const previousCache = Storage.getExpenses();
    updateCache(CACHE_KEYS.EXPENSES, previousCache.filter(e => e.id !== id));

    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      console.error('Error deleting expense:', error);
      updateCache(CACHE_KEYS.EXPENSES, previousCache);
    }
  },

  // ==================== SYNC ALL ====================
  syncAll: async (): Promise<void> => {
    if (!ensureConfigured()) return;
    console.log('🔄 Syncing all data from Supabase...');
    await Promise.all([
      Storage.fetchDailyEntries(),
      Storage.fetchIdeas(),
      Storage.fetchWeeklyOutcomes(),
      Storage.fetchTodos(),
      Storage.fetchDecisions(),
      Storage.fetchContacts(),
      Storage.fetchDiscoveries(),
      Storage.fetchExpenses(),
    ]);
    console.log('Sync complete!');
  },
};
