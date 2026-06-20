# Sprint 0: MVP Scope Freeze

**Project:** Work Expense Reimbursement Platform  
**Sprint:** 0 (Foundation)  
**Date:** 2026-06-20  
**Status:** FROZEN

---

## Purpose

This document defines the exact scope of MVP v1. Once frozen, any addition requires an explicit scope change decision. The goal is to prevent scope creep while ensuring the product delivers complete core value.

---

## MVP v1 Definition

MVP v1 is shippable when a user can:

1. Sign in with Google, Microsoft, or Magic Link
2. Add an expense in under 10 seconds
3. Attach a receipt to any expense
4. Mark an expense as "no receipt needed"
5. Organize expenses into trips
6. Create a reimbursement batch and submit it
7. Track the full expense lifecycle (draft → paid)
8. Import expenses from a CSV or XLSX file
9. See a dashboard that answers "what needs my attention?"
10. View basic reports by month and category
11. Manage categories and payment methods

---

## Features IN SCOPE

### Authentication
- [x] Google OAuth login
- [x] Microsoft OAuth login
- [x] Magic Link (email)
- [x] Auth callback and session management
- [x] Auto-create profile on first login
- [x] Seed default categories and payment methods on first login

### Expense Management
- [x] Create expense (quick capture: amount + date minimum)
- [x] Create expense (full: all fields)
- [x] Edit expense
- [x] Soft delete expense
- [x] Expense list with filters (status, date range, category)
- [x] Expense detail view
- [x] Status management: draft → ready → submitted → approved → paid → rejected
- [x] Aging indicators on stale expenses
- [x] Personal expense flag (tracking-only, not reimbursable)

### Receipt Management
- [x] Upload receipt (JPEG, PNG, WEBP, PDF)
- [x] Upload from camera (mobile)
- [x] Upload from gallery/file picker
- [x] Mark as "no receipt needed"
- [x] Multiple receipts per expense
- [x] Receipt thumbnail / file list in expense detail
- [x] Delete individual receipt

### Trip Management
- [x] Create trip
- [x] Edit trip
- [x] Soft delete trip
- [x] Trip list with status filter
- [x] Trip detail with expense list
- [x] Link expense to trip (on expense form or trip detail)
- [x] Trip total and status summary

### Reimbursement Batch Management
- [x] Create batch
- [x] Edit batch
- [x] Batch list
- [x] Batch detail with expense list
- [x] Assign expenses to batch
- [x] Remove expenses from batch
- [x] Batch status workflow: draft → submitted → approved → paid → rejected
- [x] Batch status propagates to assigned expenses
- [x] Batch total (per currency)

### Import Engine
- [x] Upload CSV or XLSX file
- [x] Parse transactions (date, amount, merchant, currency)
- [x] Review interface (per-transaction import/skip)
- [x] Duplicate detection (flag likely duplicates)
- [x] Import confirmation (creates expenses as draft)
- [x] Import history (recent sessions)

### Dashboard
- [x] Action required items (drafts aging, missing receipts, rejected)
- [x] Status summary cards (draft/ready/submitted/approved counts + amounts)
- [x] Open batches list
- [x] Open trips list
- [x] Recent activity feed (last 5 expense events)
- [x] Quick add button always visible

### Reports
- [x] By month: totals with status breakdown and category breakdown
- [x] By category: totals over selectable date range

### Settings
- [x] Profile: name, default currency
- [x] Categories: add, edit, reorder, toggle visibility
- [x] Payment methods: add, edit, set default, archive
- [x] Sign out

### Navigation
- [x] Bottom nav (mobile): Dashboard | Expenses | + | Trips | More
- [x] Left sidebar (desktop/tablet ≥ 768px)
- [x] Auth guard on all protected routes
- [x] "More" sheet: Batches, Import, Reports, Settings

---

## Features EXPLICITLY OUT OF SCOPE (v1)

### Not In MVP
- OCR / AI receipt reading
- Budget tracking
- Forecasting
- Approval workflow engine
- Email notifications
- Push notifications
- Multi-user / team features
- Organization accounts
- Admin portal
- Custom approval flows
- Native iOS / Android app
- Currency conversion
- Exchange rate tracking
- Accounting system integrations (QuickBooks, Xero, etc.)
- Vendor database
- Custom fields / expense templates
- Data export (PDF, Excel of expense reports) — v2
- Advanced analytics / charts — v2
- Trash / recovery UI — v2
- Project management (track project expenses) — v2
- Recurring expense tracking — v2
- Mileage / distance calculation — v2
- Per diem management — v2
- Open Banking API — v3

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Receipt upload fails on mobile due to file API differences | Medium | High | Test on real devices early |
| Import parser cannot handle all bank export formats | High | Medium | Build for 2-3 specific formats, show clear error for unknown |
| Duplicate detection creates false positives | Medium | Medium | Never auto-skip; always let user decide |
| Supabase Storage limits hit by heavy receipt users | Low | Medium | Compress images client-side before upload |
| Status propagation from batch to expenses has edge cases | Medium | High | Write comprehensive unit tests before implementing |

---

## Dependencies

| Dependency | Type | Required For |
|------------|------|-------------|
| Supabase project (production) | External | All features |
| Supabase project (development) | External | Local development |
| Vercel project | External | Deployment |
| Google OAuth credentials | External | Google login |
| Microsoft OAuth credentials | External | Microsoft login |
| Node.js 18+ | Local | Development |

---

## Definition of Done (Feature Level)

A feature is "done" when:

1. It works on mobile (375px viewport)
2. It works on desktop (1280px viewport)
3. Error states are handled and user-friendly
4. Empty states have CTAs
5. All repository functions include `deleted_at IS NULL`
6. Service layer validates business rules
7. RLS policy exists and is tested
8. Code review checklist passes

---

## Sprint 0 Deliverables (Architecture Phase)

- [x] Product Architecture v1
- [x] Information Architecture v1
- [x] Navigation Architecture v1
- [x] Domain Model v1
- [x] Entity Relationship Model v1
- [x] Database Architecture v1
- [x] Expense Lifecycle Definition
- [x] MVP Scope Freeze (this document)
- [x] Repository Structure
- [x] Development Standards
- [x] QA Standards
- [x] ADR Collection (ADR-001 through ADR-010)

---

*Sprint 1 begins immediately after this freeze. See SPRINT_1_PLAN.md.*
