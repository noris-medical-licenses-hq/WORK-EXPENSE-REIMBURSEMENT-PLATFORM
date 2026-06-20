# ADR-010: Import Engine Architecture

**Date:** 2026-06-20  
**Status:** Accepted  
**Deciders:** Product Architecture

---

## Context

Users frequently export transactions from their bank or credit card provider (CSV/XLSX) and want to import them as expenses rather than manually entering each one. The import engine must handle:
- Varying column structures between banks
- Duplicate detection (expense already entered manually)
- User review before committing records

## Decision

**Two-phase import: Parse → User Review → Commit. Never auto-import without review.**

### Phase 1: Parse
- Accept CSV and XLSX files
- Detect common column patterns automatically (date, amount, description, currency)
- Store raw parsed rows as JSON in `import_sessions.raw_data`
- Create one `ImportTransaction` row per parsed row
- Display to user: "Found 23 transactions from [filename]"

### Phase 2: Review
- User sees a table of all transactions
- Each row shows: date, merchant/description, amount, currency
- Each row has an action: Import / Skip / Already Exists
- System highlights likely duplicates (same date + similar amount + similar merchant)
- User can: select all, deselect all, individually toggle rows

### Phase 3: Commit
- For each selected row: create an Expense from the ImportTransaction data
- Set `import_transactions.mapped_expense_id` to the new expense id
- Set `import_transactions.status = imported`
- New expenses start as `draft` with `receipt_status = required_missing`
- Show summary: "18 imported, 3 skipped, 2 already existed"

## Duplicate Detection Algorithm

Score each imported transaction against existing expenses:

| Match Condition                          | Score Addition |
|------------------------------------------|----------------|
| Amount matches exactly                   | +40            |
| Date matches exactly                     | +30            |
| Date within ±2 days                      | +10            |
| Merchant name contains expense vendor    | +20            |
| Same currency                            | +10            |

| Total Score | Confidence Level |
|-------------|------------------|
| 80-100      | High             |
| 50-79       | Medium           |
| < 50        | Low              |

High confidence → auto-flag as "Likely Duplicate" (user can override)
Medium → flag with "Possible Duplicate"
Low → treated as new

**Never auto-skip. Always let user decide.**

## Supported Column Patterns

### Isracard / MAX / Diners (Israeli Cards)
```
Date | Business Name | Charge Amount | Currency | Transaction Amount
```

### Generic Bank Export
```
Date | Description | Debit | Credit | Balance
```

### Simple CSV
```
date | amount | description
```

The parser attempts auto-detection. If it cannot determine the structure, it asks the user to map columns manually (v2 feature — v1 shows an error for unrecognized formats).

## Consequences

**Positive:**
- Significant time savings for users with high transaction volume
- Duplicate protection prevents accidental double-entry
- User remains in control — no surprise imports

**Negative:**
- Parser must be maintained as bank export formats change
- Column mapping is complex for edge cases
- Review step adds friction (but this is intentional and safe)

## Alternatives Considered

**Auto-import without review:** Rejected. Risk of duplicates, incorrect field mapping, and wrong categories.

**Open Banking API integration:** Rejected for MVP. Requires banking partnerships, complex auth flows.
