# Entity Relationship Model v1

**Project:** Work Expense Reimbursement Platform  
**Version:** 1.0  
**Date:** 2026-06-20  
**Status:** Approved

---

## 1. ERD (Text Notation)

```
auth.users (Supabase managed)
    │ 1
    │ 1
    ▼
profiles
    │ 1
    ├──────────────────────────────────────────────────────┐
    │                                                      │
    │ 1..*                                                 │ 1..*
    ▼                                                      ▼
expense_categories                               payment_methods
    │ 0..*                                                 │ 0..*
    │                                                      │
    └──────────────────────┐           ┌──────────────────┘
                           │           │
    profiles               │           │
    │ 1                    │           │
    ├──────┐               │           │
    │      │ 1..*          │           │
    │      ▼               │           │
    │   trips ─────────────┤           │
    │      │               │           │
    │      │ 0..*          │           │
    │                      │           │
    │      ┌──────┐        │           │
    │      │      │ 1..*   │           │
    │      │      ▼        │           │
    │   projects ──────────┤           │
    │                      │           │
    │ 1                    ▼           ▼
    │ 1..*          ┌──────────────────────┐
    │               │       expenses        │  ◄── PRIMARY ENTITY
    ▼               │                      │
reimbursement_      │  id                  │
batches ───────────►│  user_id             │
    │               │  title               │
    │               │  amount              │
    │               │  currency            │
    │               │  expense_date        │
    │               │  vendor_name         │
    │               │  vendor_country      │
    │               │  category_id  ───────┤──► expense_categories
    │               │  payment_method_id ──┤──► payment_methods
    │               │  trip_id  ───────────┤──► trips (nullable)
    │               │  project_id  ────────┤──► projects (nullable)
    │               │  batch_id  ──────────┘──► reimbursement_batches (nullable)
    │               │  receipt_status      │
    │               │  reimbursement_status│
    │               │  is_personal         │
    │               │  notes               │
    │               │  deleted_at          │
    │               └──────────┬───────────┘
    │                          │ 1
    │                          │ 0..*
    │                          ▼
    │                       receipts
    │                          │
    │                          │ (file stored in Supabase Storage)
    │                          ▼
    │                    [storage bucket]
    │                    receipts/{user_id}/{expense_id}/{filename}
    │
    │
    profiles
    │ 1
    │ 1..*
    ▼
import_sessions
    │ 1
    │ 1..*
    ▼
import_transactions
    │ 0..1
    │
    ▼
expenses (mapped_expense_id — after import)
```

---

## 2. Relationship Table

| From                 | To                    | Type    | Nullable | Behavior on Delete          |
|----------------------|-----------------------|---------|----------|-----------------------------|
| auth.users           | profiles              | 1:1     | No       | Cascade                     |
| profiles             | expenses              | 1:many  | No       | Restrict (soft delete only) |
| profiles             | expense_categories    | 1:many  | No       | Restrict                    |
| profiles             | payment_methods       | 1:many  | No       | Restrict                    |
| profiles             | trips                 | 1:many  | No       | Restrict (soft delete only) |
| profiles             | projects              | 1:many  | No       | Restrict (soft delete only) |
| profiles             | reimbursement_batches | 1:many  | No       | Restrict                    |
| profiles             | import_sessions       | 1:many  | No       | Cascade                     |
| import_sessions      | import_transactions   | 1:many  | No       | Cascade                     |
| expenses             | receipts              | 1:many  | Yes      | Cascade                     |
| expense_categories   | expenses              | 1:many  | Yes      | Set null (category_id)      |
| payment_methods      | expenses              | 1:many  | Yes      | Set null (payment_method_id)|
| trips                | expenses              | 1:many  | Yes      | Set null (trip_id)          |
| projects             | expenses              | 1:many  | Yes      | Set null (project_id)       |
| reimbursement_batches| expenses              | 1:many  | Yes      | Set null (batch_id)         |
| expenses             | import_transactions   | 1:1     | Yes      | Set null (mapped_expense_id)|

---

## 3. Key Constraints

### 3.1 Expense Integrity
```sql
-- Amount must be positive
CHECK (amount > 0)

-- Receipt status valid values
CHECK (receipt_status IN ('not_required', 'required_missing', 'uploaded'))

-- Reimbursement status valid values
CHECK (reimbursement_status IN ('draft', 'ready', 'submitted', 'approved', 'paid', 'rejected'))

-- Currency must be 3-char ISO code
CHECK (length(currency) = 3)
```

### 3.2 Batch Integrity
```sql
-- Batch status valid values
CHECK (status IN ('draft', 'submitted', 'approved', 'paid', 'rejected'))

-- Paid date only set when status is paid
CHECK (paid_at IS NULL OR status = 'paid')
```

### 3.3 Trip Integrity
```sql
-- End date must be >= start date when both present
CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)

-- Trip status valid values
CHECK (status IN ('planning', 'active', 'completed', 'cancelled'))
```

---

## 4. Index Strategy

### Primary Performance Indexes
```sql
-- Most common query: expenses by user, by date (dashboard, lists)
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date DESC)
  WHERE deleted_at IS NULL;

-- Status filtering (dashboard metrics)
CREATE INDEX idx_expenses_user_status ON expenses(user_id, reimbursement_status)
  WHERE deleted_at IS NULL;

-- Receipt status filtering (missing receipts view)
CREATE INDEX idx_expenses_user_receipt ON expenses(user_id, receipt_status)
  WHERE deleted_at IS NULL AND receipt_status = 'required_missing';

-- Batch lookup
CREATE INDEX idx_expenses_batch ON expenses(batch_id)
  WHERE batch_id IS NOT NULL AND deleted_at IS NULL;

-- Trip lookup
CREATE INDEX idx_expenses_trip ON expenses(trip_id)
  WHERE trip_id IS NOT NULL AND deleted_at IS NULL;

-- Import session status
CREATE INDEX idx_import_sessions_user ON import_sessions(user_id, status);

-- Import transactions by session
CREATE INDEX idx_import_txn_session ON import_transactions(session_id, status);
```

---

## 5. Soft Delete Pattern

All major entities use soft delete via `deleted_at timestamp`.

**Rules:**
- Never hard-delete expenses
- Never hard-delete trips
- Never hard-delete projects
- Hard-delete is allowed for receipts only when explicitly removing a file
- RLS policies include `deleted_at IS NULL` filter
- A "trash" / recovery view may be added in future sprints

---

## 6. Computed Values (Not Stored)

These are intentionally NOT stored in the database to avoid sync issues:

| Value                     | How to Compute                                          |
|---------------------------|---------------------------------------------------------|
| Batch total amount        | SUM(expenses.amount) WHERE batch_id = :batch_id        |
| Trip total amount         | SUM(expenses.amount) WHERE trip_id = :trip_id          |
| Trip open amount          | SUM WHERE trip_id = :id AND status != 'paid'           |
| User total pending        | SUM WHERE user_id = :id AND status IN ('draft','ready')|
| Receipt count per expense | COUNT(receipts) WHERE expense_id = :id                 |

These are computed at query time via Postgres views or in the service layer.

---

*Next: See DATABASE_ARCHITECTURE.md for SQL schema and migration strategy.*
