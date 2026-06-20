# ADR-008: Mobile-First Navigation Pattern

**Date:** 2026-06-20  
**Status:** Accepted  
**Deciders:** Product Architecture

---

## Context

The primary use case is a person on the go who just paid for something and wants to capture it immediately. The device is a phone. The decision is: what navigation pattern best serves this use case?

Options:
1. Bottom tab bar (mobile native pattern)
2. Top navigation bar
3. Hamburger/sidebar
4. Gesture-only navigation

## Decision

**Bottom tab bar with a centered Floating Action Button for expense creation.**

On desktop (≥ 768px), the bottom tab bar transitions to a left sidebar.

## Rationale

- Bottom navigation is reachable with one thumb on all phone sizes (including large phones)
- Top navigation requires stretching up — poor for one-handed use
- Hamburger menus hide navigation — slows down users who need to act quickly
- The FAB (+ button) for "new expense" must be the most prominent UI element in the entire app
- This pattern is used by Expensify, Google Pay, and most modern expense tools

## Tab Count

5 tabs maximum (including FAB):
1. Dashboard
2. Expenses
3. + (FAB — center)
4. Trips
5. More (sheet for batches, import, reports, settings)

## FAB Specification

- Always visible in bottom bar
- Center position (not right edge)
- Larger than other tab icons
- Primary brand color
- Single action: opens /expenses/new
- Does not open a "what do you want to add?" menu — goes directly to expense entry

## Consequences

**Positive:**
- One-handed operation optimized
- "Add expense" is always one tap away
- Familiar pattern reduces learning curve

**Negative:**
- Bottom bar competes with phone's native gesture area on some devices
- Limits primary nav to 4-5 items (secondary items go in "More")

## Alternatives Considered

**Sidebar only:** Rejected. Not reachable with thumb for tall phones.

**Top nav with FAB:** Rejected. Top nav requires reaching across the phone.

**Gesture navigation:** Rejected. Non-discoverable, confusing for new users.
