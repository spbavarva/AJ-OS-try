
export type Category = 'Content' | 'Blog' | 'Product' | 'Deep_Work' | 'Life' | 'Growth' | 'Random';
export type Urgency = 'Low' | 'Medium' | 'High';

export interface DailyEntry {
  id: string;
  date: string;
  workedOn: string;
  shipped: string;
  traceDate: string;
  pinned?: boolean;
  position?: number;
}

export interface Idea {
  id: string;
  date: string;
  thought: string;
  category: Category;
  urgency: Urgency;
  status: 'Inbox' | 'Archived' | 'Approved';
  platform?: 'X' | 'LinkedIn' | 'YouTube'; // For Content ideas
  executed?: boolean; // Track if idea was successfully completed
  pinned?: boolean; // Track if idea is pinned for quick access
  traceDate: string;
}

export interface WeeklyOutcome {
  id: string;
  weekStarting: string;
  build: string;
  ship: string;
  learn: string;
  status: 'Successful' | 'Partial' | 'Failed';
  reviewGenerated?: boolean;
  traceDate: string;
}

export type TodoPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TodoStatus = 'Pending' | 'In Progress' | 'Completed';
export type TimeSlot = 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Anytime';

export interface Todo {
  id: string;
  title: string;
  details: string;
  deadline: string; // ISO date string
  priority: TodoPriority;
  status: TodoStatus;
  completed: boolean;
  createdAt: string;
  traceDate: string;
  timeSlot?: TimeSlot; // When to work on this task
  targetTime?: string; // Specific time to finish (HH:MM format)
  pinned?: boolean; // Track if todo is pinned for quick access
  completedAt?: string; // ISO timestamp when task was marked as completed
}

export interface DecisionGate {
  id: string;
  date: string;
  decision: string;
  outcome: string;
  status: 'Pending' | 'Decided';
  traceDate: string;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  linkedin: string;
  xAccount: string;
  notes: string;
  dateAdded: string; // Keep for compatibility, but transition to traceDate
  traceDate: string;
  avatarUrl?: string;
}

export type DiscoveryImpact = 'Linear' | 'Exponential' | 'Disruptive';

export interface Discovery {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  impact: DiscoveryImpact;
  dateAdded: string; // Keep for compatibility
  traceDate: string;
  pinned?: boolean; // Track if discovery is pinned for quick access
}

export type ExpenseCategory = 'House Rent' | 'Groceries' | 'Eating Out' | 'Subscriptions' | 'Shopping' | 'Miscellaneous';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string;
  traceDate: string;
}
