# ADR-001: Expenses as the Primary Entity

**Date:** 2026-06-20  
**Status:** Accepted  
**Deciders:** Product Architecture

---

## Context

The platform must support both travel-related expenses (tied to a trip) and general business expenses (not tied to any trip). The question was: should the data model be organized around **Trips** (with expenses as sub-records) or around **Expenses** (with trips as optional containers)?

Many expense tools (e.g., older versions of Concur) are trip-centric, making it painful to track standalone expenses like monthly phone bills, equipment purchases, or recurring office supplies.

## Decision

**Expenses are the primary entity. Trips are optional organizational containers.**

An expense can exist without a trip. A trip is simply a filter/grouping mechanism for expenses that happen to be travel-related.

## Rationale

- The product mission is "no reimbursable expense should ever be forgotten" — this applies equally to taxi rides and equipment purchases
- Forcing a trip context for non-travel expenses creates unnecessary friction
- The user should be able to add a quick expense in under 10 seconds without thinking about trip assignment
- Trips, projects, and batches are all optional — expenses are not

## Consequences

**Positive:**
- Clean, flexible data model
- Expenses work independently of organizational containers
- Easy to add new container types (events, clients) without restructuring

**Negative:**
- Dashboard must aggregate at the expense level, not the trip level
- Reports are more complex (must handle both grouped and ungrouped expenses)

## Alternatives Considered

**Trip-centric model:** Rejected. Would require all expenses to belong to a trip, blocking non-travel use cases.

**Flat model (no containers):** Rejected. Power users need to organize expenses by trip/project for batch submissions.
