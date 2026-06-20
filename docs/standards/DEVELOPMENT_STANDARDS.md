# Development Standards v1

**Project:** Work Expense Reimbursement Platform  
**Version:** 1.0  
**Date:** 2026-06-20  
**Status:** Approved

---

## 1. TypeScript Standards

### 1.1 Strict Mode
TypeScript strict mode is required.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 1.2 No `any`
`any` is forbidden. Use `unknown` when a type is truly dynamic. Justify with a comment if `unknown` is needed.

### 1.3 Types vs Interfaces
- Use `type` for domain types (Expense, Trip, Batch)
- Use `interface` for contract shapes (repository interfaces, service interfaces)
- Never use class for domain models — plain types only

### 1.4 Enums
Prefer `const` enums or `as const` objects over TypeScript enum keyword.

```typescript
// Preferred
export const ReimbursementStatus = {
  DRAFT: 'draft',
  READY: 'ready',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  PAID: 'paid',
  REJECTED: 'rejected',
} as const;

export type ReimbursementStatus = typeof ReimbursementStatus[keyof typeof ReimbursementStatus];
```

---

## 2. File and Folder Naming

| Type            | Convention        | Example                          |
|-----------------|-------------------|----------------------------------|
| Components      | PascalCase        | `ExpenseCard.tsx`                |
| Hooks           | camelCase + use   | `useExpenses.ts`                 |
| Services        | camelCase.service | `expense.service.ts`             |
| Repositories    | camelCase.repo    | `expense.repository.ts`          |
| Types           | camelCase.types   | `expense.types.ts`               |
| Pages (App Router) | lowercase      | `page.tsx`, `layout.tsx`         |
| Constants       | SCREAMING_SNAKE   | `EXPENSE_STATUS.ts`              |
| Utility functions | camelCase       | `formatCurrency.ts`              |

---

## 3. Repository Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx            # Auth guard layout
│   │   ├── page.tsx              # Dashboard
│   │   ├── expenses/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── trips/
│   │   ├── batches/
│   │   ├── import/
│   │   ├── reports/
│   │   └── settings/
│   ├── api/                      # API routes (minimal — prefer client calls)
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                       # shadcn/ui primitives (auto-generated)
│   ├── expenses/
│   │   ├── ExpenseCard.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── ExpenseList.tsx
│   │   ├── ExpenseStatusBadge.tsx
│   │   └── ReceiptUploader.tsx
│   ├── dashboard/
│   │   ├── ActionRequiredCard.tsx
│   │   ├── StatusSummary.tsx
│   │   └── RecentActivity.tsx
│   ├── trips/
│   ├── batches/
│   ├── import/
│   ├── shared/
│   │   ├── AmountInput.tsx
│   │   ├── CurrencySelector.tsx
│   │   ├── DatePicker.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── PageHeader.tsx
│   └── layout/
│       ├── BottomNav.tsx
│       ├── Sidebar.tsx
│       └── TopBar.tsx
│
├── lib/
│   ├── repositories/
│   │   ├── expense.repository.ts
│   │   ├── receipt.repository.ts
│   │   ├── trip.repository.ts
│   │   ├── batch.repository.ts
│   │   ├── category.repository.ts
│   │   ├── payment-method.repository.ts
│   │   └── import.repository.ts
│   ├── services/
│   │   ├── expense.service.ts
│   │   ├── receipt.service.ts
│   │   ├── trip.service.ts
│   │   ├── batch.service.ts
│   │   └── import.service.ts
│   ├── supabase/
│   │   ├── client.ts             # Browser client (singleton)
│   │   ├── server.ts             # Server component client
│   │   └── types.ts              # Generated DB types (supabase gen types)
│   ├── types/
│   │   ├── expense.types.ts
│   │   ├── trip.types.ts
│   │   ├── batch.types.ts
│   │   ├── receipt.types.ts
│   │   └── import.types.ts
│   ├── constants/
│   │   ├── currencies.ts
│   │   ├── countries.ts
│   │   └── status.ts
│   └── utils/
│       ├── formatCurrency.ts
│       ├── formatDate.ts
│       ├── sanitizeFilename.ts
│       └── importParser.ts
│
├── hooks/
│   ├── useExpenses.ts
│   ├── useExpense.ts
│   ├── useDashboard.ts
│   ├── useTrip.ts
│   ├── useBatch.ts
│   └── useImport.ts
│
└── supabase/
    ├── migrations/
    └── seed/
```

---

## 4. Component Standards

### 4.1 Component Responsibilities
- Components render UI only
- Components call hooks, not services
- No `supabase` imports in components
- No business logic in components

### 4.2 Component Size
- Max 200 lines per component file
- If a component exceeds 200 lines, extract sub-components

### 4.3 Props
- All props must be typed
- No prop drilling beyond 2 levels — use context or hooks

### 4.4 Server vs Client Components
- Prefer Server Components for data-fetching pages
- Use `"use client"` only for interactive components
- Keep the "client boundary" as low in the tree as possible

---

## 5. Error Handling

### 5.1 Repository Errors
Repositories throw typed errors:

```typescript
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}
```

### 5.2 Service Errors
Services throw domain errors:

```typescript
export class ExpenseValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Cannot transition from ${from} to ${to}`);
  }
}
```

### 5.3 UI Error Handling
- Use Next.js `error.tsx` for page-level errors
- Use React state for form validation errors
- Never show raw error messages to users — show friendly messages
- Log full errors to console in development only

---

## 6. Form Standards

### 6.1 Form Library
Use React Hook Form for all forms.

### 6.2 Validation
Use Zod for all form validation schemas.

```typescript
const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
});
```

### 6.3 Optimistic Updates
For status changes and quick actions, use optimistic updates to ensure the UI feels immediate.

---

## 7. Styling Standards

### 7.1 Tailwind Only
All styling is done with Tailwind CSS classes. No inline styles except for dynamic values (e.g., category color hex).

### 7.2 shadcn/ui
Use shadcn/ui components as the base. Extend via Tailwind class props. Never modify shadcn components directly — wrap them.

### 7.3 Responsive Breakpoints
```
mobile: < 768px  (default — design here first)
tablet: ≥ 768px  (md:)
desktop: ≥ 1024px (lg:)
```

### 7.4 Color System
Use Tailwind CSS variables / design tokens. No hardcoded hex colors except for user-defined category colors.

---

## 8. Commit Message Standards

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `arch`: Architecture / structural change
- `docs`: Documentation only
- `refactor`: Code restructuring (no behavior change)
- `test`: Test additions or changes
- `chore`: Config, tooling, dependencies

Examples:
```
feat(expenses): add receipt upload component
fix(batch): correct status propagation to expenses
arch(repo): add expense repository with soft delete support
docs(adr): add ADR-010 import engine architecture
```

---

## 9. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=          # Safe to expose to browser
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Safe to expose to browser
SUPABASE_SERVICE_ROLE_KEY=         # NEVER expose to browser
```

**Hard rule:** `SUPABASE_SERVICE_ROLE_KEY` must never appear in any file under `src/` or `components/`.

---

## 10. Code Review Checklist

Before any PR is merged:

- [ ] No `any` types
- [ ] No Supabase imports in components or hooks
- [ ] All new DB tables have RLS policies
- [ ] No hardcoded user IDs or credentials
- [ ] Form inputs have Zod validation
- [ ] Error states are handled (not just success states)
- [ ] Mobile viewport tested
- [ ] Soft delete filter applied in all repository queries
- [ ] No `console.log` left in production code

---

*See QA_STANDARDS.md for testing requirements.*
