# Sprint 1: Project Bootstrap & Database Foundation

**Project:** Work Expense Reimbursement Platform  
**Sprint:** 1  
**Start:** 2026-06-20  
**Goal:** Working Next.js app deployed to Vercel with complete Supabase schema, authentication, and empty but navigable shell

---

## Sprint Goal

At the end of Sprint 1, the following must be true:

1. The repository has a working Next.js 14 app (App Router, TypeScript, Tailwind, shadcn/ui)
2. Supabase project is configured with full schema (all tables, enums, RLS, triggers)
3. Authentication works: Google, Microsoft, Magic Link
4. A new user can sign in and see the dashboard shell
5. Navigation (bottom bar mobile / sidebar desktop) is functional
6. App is deployed and accessible on Vercel
7. Development environment is fully reproducible from README

---

## Sprint 1 Scope

### Mandatory for Sprint 1

#### 1. Repository Setup
- [ ] Initialize Next.js 14 with App Router, TypeScript strict
- [ ] Configure Tailwind CSS
- [ ] Initialize shadcn/ui
- [ ] Configure ESLint + Prettier
- [ ] Configure path aliases (`@/lib`, `@/components`, `@/hooks`)
- [ ] Create `.env.local.example` with required variables
- [ ] Create `README.md` with setup instructions
- [ ] Configure `tsconfig.json` (strict mode)

#### 2. Supabase Database Schema
- [ ] Migration: enums (reimbursement_status, receipt_status, etc.)
- [ ] Migration: profiles table + trigger (auto-create on signup)
- [ ] Migration: expense_categories table
- [ ] Migration: payment_methods table
- [ ] Migration: trips table
- [ ] Migration: projects table
- [ ] Migration: reimbursement_batches table
- [ ] Migration: expenses table (core)
- [ ] Migration: receipts table
- [ ] Migration: import_sessions table
- [ ] Migration: import_transactions table
- [ ] Migration: all indexes
- [ ] Migration: seed default categories (function)
- [ ] Migration: seed default payment methods (function)
- [ ] Migration: all RLS policies
- [ ] Migration: expense_summary view
- [ ] Migration: utility functions (update_updated_at, handle_new_user)

#### 3. Supabase Type Generation
- [ ] Configure `supabase gen types typescript` output to `src/lib/supabase/types.ts`
- [ ] Add npm script: `npm run db:types`

#### 4. Supabase Client Setup
- [ ] `src/lib/supabase/client.ts` — browser singleton
- [ ] `src/lib/supabase/server.ts` — server component client
- [ ] `src/lib/supabase/middleware.ts` — session refresh middleware

#### 5. Authentication
- [ ] `/app/(auth)/login/page.tsx` — login page (Google, Microsoft, Magic Link buttons)
- [ ] `/app/auth/callback/route.ts` — OAuth callback handler
- [ ] Auth guard layout for protected routes
- [ ] Redirect unauthenticated users to `/auth/login`
- [ ] Redirect authenticated users from `/auth/login` to `/`

#### 6. Application Shell
- [ ] `BottomNav` component (mobile)
- [ ] `Sidebar` component (desktop)
- [ ] `TopBar` component
- [ ] Responsive layout wrapper
- [ ] Protected layout with auth check

#### 7. Dashboard Shell
- [ ] Dashboard page with placeholder cards
- [ ] Status summary cards (showing 0s — real data in Sprint 2)

#### 8. Empty Pages (Shell Only)
- [ ] `/expenses` — empty state with CTA
- [ ] `/trips` — empty state with CTA
- [ ] `/batches` — empty state with CTA (accessible via "More")
- [ ] `/import` — file upload placeholder
- [ ] `/reports` — placeholder
- [ ] `/settings` — profile settings form (real in Sprint 2)

#### 9. Vercel Deployment
- [ ] Connect repository to Vercel project
- [ ] Configure environment variables in Vercel
- [ ] Successful production deployment
- [ ] Confirm auth flow works in production

---

## Deferred to Sprint 2

- Expense CRUD (create, read, update, delete)
- Receipt upload
- All real data in dashboard
- Trip management
- Category management
- Payment method management

---

## Technical Risks

| Risk | Mitigation |
|------|-----------|
| OAuth redirect URLs differ between dev and prod | Configure both in Supabase and provider settings |
| Supabase RLS blocks auth trigger | Use SECURITY DEFINER on handle_new_user function |
| TypeScript strict mode catches many issues at start | Fix them — do not loosen strict settings |
| shadcn/ui and Tailwind version conflicts | Pin versions, follow shadcn/ui init docs exactly |

---

## Definition of Done — Sprint 1

- [ ] `npm run dev` starts the app with no errors
- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] User can sign in with Google in production
- [ ] User can sign in with Magic Link in production
- [ ] Supabase database has all tables, RLS enabled
- [ ] `npm run db:types` regenerates types without errors
- [ ] Vercel deployment is live and accessible
- [ ] README setup instructions are complete and accurate

---

## Rollback Plan

If Sprint 1 fails catastrophically:
- All changes are in git — revert to empty repo state
- Supabase schema can be reset via `supabase db reset`
- Vercel deployment can be rolled back to previous deployment
- No user data exists yet — safe to reset without consequences

---

*Sprint 2 will implement Expense CRUD + Receipt Upload.*
