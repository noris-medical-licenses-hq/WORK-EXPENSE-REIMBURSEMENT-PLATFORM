# Work Expense Reimbursement Platform

> "No reimbursable expense should ever be forgotten."

A mobile-first expense tracking and reimbursement management platform for employees, consultants, and freelancers.

---

## Product Overview

This platform exists for one reason: to ensure every reimbursable expense is tracked, submitted, and recovered.

At any moment the user can answer:
- What expenses exist?
- Which need to be submitted?
- Which are missing receipts?
- Which were approved but not yet paid?
- How much money am I waiting to get back?

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 14 (App Router), TypeScript     |
| Styling    | Tailwind CSS + shadcn/ui                |
| Backend    | Supabase (PostgreSQL + Auth + Storage)  |
| Hosting    | Vercel                                  |
| Dev Tools  | Claude Code                             |

---

## Architecture

```
UI Components
    ↓
Custom React Hooks
    ↓
Service Layer  (business logic)
    ↓
Repository Layer  (data access)
    ↓
Supabase (PostgreSQL + Storage)
```

**Rule:** No Supabase imports in components. All data flows through Services → Repositories.

---

## Prerequisites

- Node.js 18+
- npm 9+
- Supabase CLI (`npm install -g supabase`)
- Git

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd work-expense-reimbursement-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Start local Supabase (optional — or use cloud project)

```bash
supabase start
```

### 5. Run database migrations

```bash
supabase db push
```

### 6. Generate TypeScript types

```bash
npm run db:types
```

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Available Scripts

| Command               | Description                                    |
|-----------------------|------------------------------------------------|
| `npm run dev`         | Start development server                       |
| `npm run build`       | Build for production                           |
| `npm run start`       | Start production server                        |
| `npm run lint`        | Run ESLint                                     |
| `npm run type-check`  | TypeScript check without emitting              |
| `npm run db:types`    | Regenerate Supabase TypeScript types           |
| `npm run db:push`     | Push migrations to Supabase                    |
| `npm test`            | Run all tests                                  |

---

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components (UI only)
├── hooks/               # Custom React hooks
├── lib/
│   ├── repositories/    # Data access layer (Supabase calls)
│   ├── services/        # Business logic layer
│   ├── supabase/        # Supabase client setup
│   ├── types/           # Domain type definitions
│   ├── constants/       # Enums and constants
│   └── utils/           # Utility functions
└── supabase/
    ├── migrations/      # Database migrations
    └── seed/            # Seed data
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Product Architecture](docs/architecture/PRODUCT_ARCHITECTURE.md) | System overview, layers, principles |
| [Domain Model](docs/architecture/DOMAIN_MODEL.md) | Entity definitions and business rules |
| [Entity Relationship Model](docs/architecture/ENTITY_RELATIONSHIP_MODEL.md) | Database relationships |
| [Database Architecture](docs/architecture/DATABASE_ARCHITECTURE.md) | Full SQL schema and RLS policies |
| [Expense Lifecycle](docs/architecture/EXPENSE_LIFECYCLE.md) | Status flow and transition rules |
| [Information Architecture](docs/architecture/INFORMATION_ARCHITECTURE.md) | Screen inventory and site map |
| [Navigation Architecture](docs/architecture/NAVIGATION_ARCHITECTURE.md) | Routing and navigation patterns |
| [UX Specifications](docs/ux/UX_SPECIFICATIONS.md) | Design system and component specs |
| [Development Standards](docs/standards/DEVELOPMENT_STANDARDS.md) | Code standards and conventions |
| [QA Standards](docs/standards/QA_STANDARDS.md) | Testing requirements and checklists |
| [MVP Scope](docs/sprints/SPRINT_0_MVP_SCOPE.md) | Feature list and out-of-scope items |
| [Sprint 1 Plan](docs/sprints/SPRINT_1_PLAN.md) | Current sprint tasks |

### Architecture Decision Records (ADRs)

| ADR | Title |
|-----|-------|
| [ADR-001](docs/decisions/ADR-001-expenses-as-primary-entity.md) | Expenses as Primary Entity |
| [ADR-002](docs/decisions/ADR-002-single-user-architecture.md) | Single-User Architecture for MVP |
| [ADR-003](docs/decisions/ADR-003-supabase-as-backend.md) | Supabase as the Backend |
| [ADR-004](docs/decisions/ADR-004-multi-currency-display.md) | Multi-Currency Display Without Conversion |
| [ADR-005](docs/decisions/ADR-005-receipt-storage-strategy.md) | Receipt Storage Strategy |
| [ADR-006](docs/decisions/ADR-006-soft-delete-pattern.md) | Soft Delete Pattern |
| [ADR-007](docs/decisions/ADR-007-service-repository-pattern.md) | Service-Repository Pattern |
| [ADR-008](docs/decisions/ADR-008-mobile-first-navigation.md) | Mobile-First Navigation Pattern |
| [ADR-009](docs/decisions/ADR-009-reimbursement-batch-model.md) | Reimbursement Batch Model |
| [ADR-010](docs/decisions/ADR-010-import-engine-architecture.md) | Import Engine Architecture |

---

## Environment Variables

| Variable                        | Required | Description                          |
|---------------------------------|----------|--------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key               |
| `SUPABASE_SERVICE_ROLE_KEY`     | No*      | Service role key — server only       |

*`SUPABASE_SERVICE_ROLE_KEY` must NEVER be used in browser/frontend code.

---

## Deployment

The application deploys automatically via Vercel on push to `main`.

For manual deployment:
```bash
vercel --prod
```

---

## License

Private — All rights reserved.
