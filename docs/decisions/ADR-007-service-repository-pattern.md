# ADR-007: Service-Repository Pattern

**Date:** 2026-06-20  
**Status:** Accepted  
**Deciders:** Product Architecture

---

## Context

The frontend application needs a clear, maintainable way to access and manipulate data. Without structure, React components directly call Supabase, mixing UI concerns with data access, making testing difficult and creating tight coupling to the backend.

## Decision

**Enforce a Service-Repository pattern with three distinct layers:**

```
UI Component / React Hook
    ↓
Service Layer  (business logic, validation, orchestration)
    ↓
Repository Layer  (data access, Supabase calls only)
    ↓
Supabase (PostgreSQL + Storage)
```

**Hard rule: No Supabase imports in components or hooks.**

## Layer Definitions

### Repository Layer
Responsibilities:
- All Supabase client calls
- Maps DB rows to domain types
- No business logic
- Returns typed domain objects or throws typed errors

Example: `ExpenseRepository.findById(id: string): Promise<Expense>`

### Service Layer
Responsibilities:
- Business rules (e.g., "cannot move to READY if receipt is missing")
- Orchestration (e.g., "creating an expense also seeds receipt_status based on category")
- Validation (amount > 0, date not in far future)
- Status transition enforcement
- Calls one or more repositories

Example: `ExpenseService.markAsReady(id: string): Promise<Expense>`

### Hook Layer
Responsibilities:
- React state management
- Loading / error states
- Calling services
- Cache invalidation

Example: `useExpense(id: string)` — calls ExpenseService internally

### Component Layer
Responsibilities:
- Rendering only
- No data fetching
- No business logic
- No Supabase calls

## File Structure

```
src/
  lib/
    repositories/
      expense.repository.ts
      receipt.repository.ts
      trip.repository.ts
      batch.repository.ts
      category.repository.ts
      payment-method.repository.ts
      import.repository.ts
    services/
      expense.service.ts
      receipt.service.ts
      trip.service.ts
      batch.service.ts
      import.service.ts
    types/
      expense.types.ts
      trip.types.ts
      batch.types.ts
      receipt.types.ts
      import.types.ts
  hooks/
    useExpenses.ts
    useExpense.ts
    useDashboard.ts
    useBatch.ts
    useTrip.ts
    useImport.ts
```

## Consequences

**Positive:**
- Services can be unit-tested without UI
- Repositories can be mocked in service tests
- Business logic is centralized — not scattered in components
- Database access is a single, controlled seam

**Negative:**
- More files than a direct-Supabase approach
- Requires discipline to maintain layer separation

## Enforcement

Code review checklist item:
- [ ] No `supabase` client import in `/components/**`
- [ ] No `supabase` client import in `/hooks/**`
- [ ] No `supabase` client import in `/app/**`
- [ ] All data mutations go through a service function

## Alternatives Considered

**Direct Supabase calls in components:** Rejected. This is an anti-pattern that causes immediate coupling and testing difficulty.

**React Query + direct Supabase:** Rejected for MVP. React Query adds value later, but the service layer is the priority now.
