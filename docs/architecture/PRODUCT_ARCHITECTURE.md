# Product Architecture v1

**Project:** Work Expense Reimbursement Platform  
**Version:** 1.0  
**Date:** 2026-06-20  
**Status:** Approved

---

## 1. Product Mission

> "No reimbursable expense should ever be forgotten."

At any moment the user must be able to answer:

- What expenses exist?
- Which expenses still need reporting?
- Which expenses are missing documentation?
- Which expenses have already been submitted?
- Which expenses were approved?
- Which expenses have been reimbursed?
- Which reimbursement requests are still open?
- Which trips/events/projects still require action?

---

## 2. System Overview

The platform is a **single-user expense tracking and reimbursement management system** designed for employees, consultants, executives, and freelancers who regularly pay work-related expenses and later receive reimbursements from their employer or client.

The system is **not** an accounting system. The system is **not** a finance management tool. The system is an operational tool for tracking and recovering money already spent.

---

## 3. Architectural Layers

```
┌─────────────────────────────────────────┐
│              User Interface             │
│     (Next.js + Tailwind + shadcn/ui)    │
├─────────────────────────────────────────┤
│            UI Components                │
│   (Presentational — zero business logic)│
├─────────────────────────────────────────┤
│           Custom React Hooks            │
│       (State + Side Effect Bridge)      │
├─────────────────────────────────────────┤
│             Service Layer               │
│   (Business Logic + Validation Rules)   │
├─────────────────────────────────────────┤
│           Repository Layer              │
│   (Data Access — Supabase Abstraction)  │
├─────────────────────────────────────────┤
│              Supabase                   │
│  (PostgreSQL + Auth + Storage + RLS)    │
└─────────────────────────────────────────┘
```

**Mandatory rule:** UI components never call Supabase directly. All data flows through Services → Repositories → Supabase.

---

## 4. Technology Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14+ (App Router), TypeScript |
| Styling     | Tailwind CSS                        |
| Components  | shadcn/ui                           |
| Backend     | Supabase                            |
| Database    | PostgreSQL (via Supabase)           |
| Auth        | Supabase Auth (Google, Microsoft, Magic Link) |
| Storage     | Supabase Storage                    |
| Hosting     | Vercel                              |
| Dev Tooling | Claude Code                         |

---

## 5. Core Design Principles

### 5.1 Expenses Are the Foundation
Every feature must trace back to expenses. Trips, Projects, and Batches are organizational containers — they exist to serve expenses, not the reverse.

### 5.2 Capture First
Adding an expense must take under 10 seconds. This is a non-negotiable performance constraint. Every design decision that conflicts with this is rejected.

### 5.3 Mobile First
The primary device is a mobile phone. All critical paths (add expense, view status, upload receipt) must be comfortable with one hand on a phone screen.

### 5.4 Action-Driven Dashboard
The dashboard must never be charts-only. It must always answer: "What do I need to do right now?"

### 5.5 Progressive Disclosure
The entry screen is minimal. Complexity (batch assignment, project linking, vendor tagging) is available but never forced on the user at capture time.

### 5.6 No Accounting Language
The system speaks in plain language: paid, submitted, approved, reimbursed. Never: debit, credit, ledger, journal entry, accrual.

---

## 6. Primary User Flows

### 6.1 Quick Expense Capture (Critical Path)
```
User taps + button
→ Amount entered (required)
→ Date auto-filled (today)
→ Category selected (suggested from history)
→ Tap Save
→ Expense saved as Draft
```
Total time target: < 10 seconds

### 6.2 Receipt Attachment
```
User opens expense
→ Taps "Add Receipt"
→ Camera / Gallery / PDF picker
→ File uploaded to Supabase Storage
→ Receipt status updated to "uploaded"
```

### 6.3 Batch Submission
```
User opens Batches
→ Creates new batch (or selects existing)
→ Assigns expenses to batch
→ Marks batch as "Submitted"
→ Later marks as "Approved" → "Paid"
```

### 6.4 Import from Card Export
```
User opens Import
→ Uploads CSV/Excel file
→ System parses transactions
→ User reviews matches
→ Confirms import
→ Expenses created in bulk
```

---

## 7. MVP Boundaries

**In scope for MVP v1:**
- Expense CRUD with full status lifecycle
- Receipt upload (camera, gallery, PDF)
- Category management
- Payment method management
- Trip management (basic)
- Reimbursement batch management
- Dashboard with action items
- Monthly and category reports
- CSV/Excel import
- Google / Microsoft / Magic Link authentication
- Multi-currency display (no conversion)
- Soft delete with recovery

**Out of scope for MVP v1:**
- OCR / AI extraction
- Budget tracking and forecasting
- Team / multi-user features
- Approval workflow engine
- Email / push notifications
- Vendor database
- Advanced analytics
- Native mobile app (PWA only)
- Accounting system integrations
- Custom field builders

---

## 8. Data Ownership

All data is scoped to the authenticated user via Supabase Row Level Security.

No data is shared between users.

No admin portal in MVP.

---

## 9. Security Model

- Authentication: Supabase Auth (OAuth + Magic Link)
- Authorization: Row Level Security on all tables
- File Access: Storage policies scoped to user_id
- No service_role keys in frontend
- All sensitive operations via Supabase server-side functions or RLS policies

---

## 10. Scalability Considerations

The architecture is designed for single-user MVP. Future multi-user (team/company) expansion requires:
- Adding `organization_id` to all entities
- Updating RLS policies
- Adding role-based permissions

This migration path is considered in the data model design (user_id is always present, organization_id reserved).

---

*Next: See DOMAIN_MODEL.md for entity definitions.*
