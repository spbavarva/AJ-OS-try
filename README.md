# AJ OS

**The specialized personal operating system for high-output builders.**

AJ OS is a unified interface designed to consolidate the fragmented knowledge and execution workflows of creators, engineers, and founders. It moves beyond traditional productivity apps by treating your life's data as a single, integrated graph: connecting ideas to contacts, and daily logs to long-term missions.

---

## The Philosophy

Productivity systems often fail because of high friction or low capability. AJ OS is built on three core pillars:

1. **Zero-Latency Capture**: Moving a thought from your mind to the system should happen in milliseconds, not minutes.
2. **Contextual Continuity**: Your tasks should know about your logs, and your ideas should live alongside your network.
3. **Data Sovereignty**: Your data remains yours. AJ OS prioritizes local-first storage with optional cloud synchronization via Supabase.

---

## Core Modules

### Command Center
An executive overview of your current state. The Command Center surfaces active missions, recent insights, and captures the velocity of your work. It is the tactical starting point for every session.

### Mission Control (Task Engine)
Mission Control handles execution. It implements a sophisticated task management system with priority weighting, deadline tracking, and a completion auditing system that logs the exact moment of progress.

### Idea Inbox
A high-fidelity capture zone for intellectual capital. Unlike simple note-takers, the Idea Inbox supports categorization by domain (Product, Content, Growth), urgency filtering, and platform-specific metadata for X and LinkedIn.

### Daily Capture
A chronological audit of your output. Daily Capture allows you to log what you worked on and what you shipped, creating a searchable history of your professional growth and technical contributions.

### Network Node
A relational CRM for professional networks. Track roles, companies, social footprints, and meeting notes. It treats your relationships as a core component of your productivity infrastructure.

### Discovery Engine
A centralized repository for external resources. The Discovery Engine captures URLs and knowledge assets, allowing you to rank them by impact and integrate them into your active workflows.

### Analytics & Insights
Local-first data processing that identifies behavioral patterns. It tracks streaks, completion ratios, and capture rates to provide a brutal, evidence-based view of your productivity.

---

## User Interface

![Dashboard Interface](assets/dashboard-preview.png)

*The Command Center: A high-fidelity dashboard for unified information awareness.*

---

## Technical Architecture

AJ OS is built with a modern, type-safe stack designed for performance and reliability.

| Stack | Selection | Rationale |
| :--- | :--- | :--- |
| **Framework** | React 19 / TypeScript | Uncompromising type safety and state management. |
| **Foundation** | Vite | Instant HMR and optimized production builds. |
| **Database** | Supabase (PostgreSQL) | Enterprise-grade persistence with Row Level Security. |
| **Interface** | Tailwind CSS | Utility-first styling for a custom, low-overhead UI. |
| **Native** | Capacitor | Ready for deployment to iOS and Android. |

---

## Quick Start

### 1. Environment Configuration

Clone the repository and install dependencies:

```bash
git clone https://github.com/AadityasinhJadeja/AJ-OS.git
cd AJ-OS
npm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

### 2. Database Integration (Optional)

AJ OS runs in **Local-Only Mode** by default. To enable cross-device synchronization:

1. Initialize a project at [Supabase](https://supabase.com).
2. Execute the schema found in `docs/database/SUPABASE_SCHEMA_CURRENT.sql` via the SQL Editor.
3. Populate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env.local` file.

### 3. Execution

```bash
npm run dev
```

The system will be accessible at `http://localhost:3000`.

---

## Project Organization

```text
src/
├── components/      # Modular UI components
├── lib/             # Core engines: storage, database, security
├── config/          # Centralized configuration and feature flags
├── styles/          # Design system and typography
└── App.tsx          # Router and application logic

docs/
└── database/        # SQL schemas and migration history
```

For more in-depth technical details, refer to the `SECURITY.md` and the database README.

---

## Contribution

Contributions are prioritized based on system stability and workflow enhancement. Please ensure all pull requests contain updated TypeScript interfaces and maintain the zero-dependency styling approach.

---

## License

MIT License. Designed to be open, modified, and shared.
