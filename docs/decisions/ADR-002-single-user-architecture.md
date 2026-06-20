# ADR-002: Single-User Architecture for MVP

**Date:** 2026-06-20  
**Status:** Accepted  
**Deciders:** Product Architecture

---

## Context

The platform could be designed for:
1. Single user (personal expense tracker for one person)
2. Multi-user (team members submitting to a shared organization)
3. Multi-tenant (multiple organizations, each with users)

Each model has dramatically different implications for schema design, auth, RLS policies, and UI complexity.

## Decision

**MVP is single-user. Each user owns their own data exclusively.**

There is no organization, no team, no shared data, no admin portal in v1.

## Rationale

- The primary use case described is a single person tracking their own expenses
- Multi-user requires role-based permissions, approval workflows, and a whole secondary UX
- Single-user allows the fastest possible MVP
- All core features (expense capture, receipt upload, batch management) work identically in single-user
- The data model is designed to accommodate a future `organization_id` field without major refactoring

## Migration Path to Multi-User (Future)

If multi-user is added in future:
1. Add `organizations` table
2. Add `organization_id` to all entities
3. Update RLS policies to check organization membership
4. Add roles: `owner`, `member`, `approver`
5. The expense entity shape does not change

## Consequences

**Positive:**
- Dramatically simpler auth model
- No approval workflow needed in v1
- No admin portal needed in v1
- Faster to build and launch

**Negative:**
- Cannot support "submit to your manager" workflow until v2
- Cannot support team expense views

## Alternatives Considered

**Multi-user from day one:** Rejected. Doubles scope. The core product value (individual expense tracking) doesn't require it.
