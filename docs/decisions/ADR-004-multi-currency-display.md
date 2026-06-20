# ADR-004: Multi-Currency Display Without Conversion

**Date:** 2026-06-20  
**Status:** Accepted  
**Deciders:** Product Architecture

---

## Context

Business travel and international expenses occur in many currencies. The system must handle expenses in different currencies. The question is: should the system **convert** all amounts to a base currency, or simply **display** them in their original currency?

## Decision

**Store and display expenses in their original currency. No automatic currency conversion in MVP.**

Each expense stores:
- `amount` — the amount as paid
- `currency` — the ISO 4217 currency code (USD, EUR, ILS, GBP, etc.)

Totals in reports show per-currency breakdowns when mixed currencies are present.

## Rationale

- Currency conversion requires an exchange rate service (API + historical rates)
- Historical rate accuracy matters for accounting — wrong rates could cause discrepancies
- The user already knows what they paid; what they care about is tracking that amount for reimbursement
- Most users submit expenses in the original currency to their employer anyway
- Multi-currency reporting is complex and adds significant scope

## Display Rules

- Each expense shows its amount in its original currency
- Reports that mix currencies show subtotals per currency
- No "converted total" in MVP
- Default currency is set per user profile (used as default on new expense)

## Future Consideration

In v2, optionally add:
- Manual exchange rate entry per expense (for accounting purposes)
- Integration with a rate provider (Fixer.io, Open Exchange Rates)
- A "base currency" concept with converted totals

## Consequences

**Positive:**
- No rate API integration complexity
- No historical rate accuracy concerns
- Simple implementation

**Negative:**
- Cannot show a single total when expenses are in mixed currencies
- Reports require per-currency handling

## Alternatives Considered

**Auto-convert to base currency:** Rejected for MVP. Requires reliable rate source, historical data, and user trust in the rates shown.

**Force single currency:** Rejected. International users would have no way to track foreign expenses accurately.
