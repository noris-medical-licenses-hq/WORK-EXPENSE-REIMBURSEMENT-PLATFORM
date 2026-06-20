# ADR-006: Soft Delete Pattern

**Date:** 2026-06-20  
**Status:** Accepted  
**Deciders:** Product Architecture

---

## Context

Users may accidentally delete expenses. Financial records should not be permanently destroyed without explicit confirmation. The system needs a deletion strategy that prevents data loss while keeping the UI clean.

## Decision

**All core entities use soft delete via a `deleted_at` timestamp column.**

An entity with `deleted_at IS NOT NULL` is considered deleted and excluded from all standard queries.

## Entities Using Soft Delete

- expenses (always soft delete)
- trips (always soft delete)
- projects (always soft delete)

## Entities Using Hard Delete

- receipts (can be hard deleted — expense record still exists)
- import_sessions (completed sessions may be hard deleted)
- import_transactions (hard delete with parent session)
- expense_categories (archive via `is_active = false`, never delete)
- payment_methods (archive via `is_active = false`, never delete)

## Implementation

### Query Filter
All standard queries include `WHERE deleted_at IS NULL`.

This is enforced at the **Repository layer** — not at the UI layer.

### RLS
RLS policies include `deleted_at IS NULL` in the USING clause for read operations.

### Recovery
In v1: no recovery UI (the records are kept but not accessible)
In v2: add a "Recently Deleted" view with 30-day recovery window

### Batch + Expense Interaction
If an expense is soft-deleted, it is automatically removed from its batch.

## Consequences

**Positive:**
- Prevents accidental permanent data loss
- Audit trail preserved
- Easy to add recovery UI later

**Negative:**
- Queries must always include `deleted_at IS NULL` filter
- Storage grows over time with deleted records
- RLS policy complexity increases slightly

## Alternatives Considered

**Hard delete:** Rejected. Financial data should not be permanently destroyed casually.

**Separate archive table:** Rejected. Over-engineering for MVP. Soft delete achieves the same goal.
