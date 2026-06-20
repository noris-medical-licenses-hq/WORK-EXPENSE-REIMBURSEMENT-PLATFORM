# ADR-009: Reimbursement Batch Model

**Date:** 2026-06-20  
**Status:** Accepted  
**Deciders:** Product Architecture

---

## Context

Users submit expenses to employers or clients in groups — typically once a month or at the end of a trip. The system needs to model this submission cycle. The question is how tightly to couple expense status to the batch status.

## Decision

**ReimbursementBatch is a loose container. Expenses inherit batch status transitions but can override individually.**

## Batch Model Rules

1. A batch is created by the user with a name (e.g., "May 2026 Expenses")
2. User assigns expenses to the batch (expenses must be in `ready` status to be assigned)
3. User marks the batch as `submitted` → all assigned expenses become `submitted`
4. Employer/client responds → user marks batch as `approved` or `rejected`
5. Payment arrives → user marks batch as `paid` → all expenses become `paid`

## Individual Override Rule

If a specific expense is rejected within an otherwise approved batch, the user can:
- Set that expense to `rejected` individually
- Remove it from the batch
- Resubmit it in a future batch

The batch can still proceed to `paid` for the remaining expenses.

## Batch Total Computation

Batch totals are computed on-demand (not stored):
```sql
SELECT SUM(amount) FROM expenses WHERE batch_id = :id AND deleted_at IS NULL
```

Multi-currency batches show per-currency totals:
```sql
SELECT currency, SUM(amount) FROM expenses 
WHERE batch_id = :id AND deleted_at IS NULL
GROUP BY currency
```

## Batch Naming Convention (Suggested)

The system suggests batch names when creating:
- "June 2026 Expenses"
- "Trip: [Trip Name]"
- User can override

## Consequences

**Positive:**
- Natural model for how reimbursements actually work
- Bulk status updates reduce manual effort
- Still allows individual expense management

**Negative:**
- Sync between batch status and individual expense status requires careful implementation
- Multi-currency batches cannot show a single total

## Alternatives Considered

**Report-based submission (no batch entity):** Rejected. Users need to track the status of each submission cycle independently.

**Strict batch-owned expenses:** Rejected. Would prevent resubmitting a rejected expense without duplicating the expense record.
