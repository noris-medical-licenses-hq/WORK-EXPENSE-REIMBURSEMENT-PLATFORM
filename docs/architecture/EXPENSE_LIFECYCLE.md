# Expense Lifecycle Definition v1

**Project:** Work Expense Reimbursement Platform  
**Version:** 1.0  
**Date:** 2026-06-20  
**Status:** Approved

---

## 1. Status Flow Diagram

```
                    ┌─────────────────────────────────────┐
                    │  User pays an expense (any method)  │
                    └───────────────┬─────────────────────┘
                                    │
                                    ▼
                              ┌──────────┐
                              │  DRAFT   │  ← Default status on creation
                              └────┬─────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │  User completes required fields   │
                    │  + receipt attached (or waived)   │
                    └──────────────┬──────────────────┘
                                   │
                                   ▼
                            ┌────────────┐
                            │   READY    │  ← Ready for submission
                            └─────┬──────┘
                                  │
                    ┌─────────────▼──────────────────────┐
                    │  User adds expense to a batch       │
                    │  AND marks batch as "Submitted"     │
                    └─────────────┬──────────────────────┘
                                  │
                                  ▼
                           ┌───────────────┐
                           │   SUBMITTED   │  ← Sent to employer/client
                           └──────┬────────┘
                                  │
                    ┌─────────────┼──────────────┐
                    │             │              │
                    ▼             ▼              ▼
             ┌──────────┐  ┌──────────┐  ┌──────────┐
             │ APPROVED │  │ REJECTED │  │(no change)|
             └────┬─────┘  └────┬─────┘  └──────────┘
                  │             │
                  │             │  User corrects and resubmits
                  │             └──────────────────► READY
                  │
                  ▼
            ┌──────────┐
            │   PAID   │  ← Funds received
            └──────────┘
```

---

## 2. Status Definitions

### DRAFT
**Meaning:** Expense has been captured but is not yet complete or ready to submit.

**Triggers into DRAFT:**
- Any new expense is created (always starts here)
- A rejected expense is revised

**Required to leave DRAFT:**
- `title` is set
- `amount > 0`
- `expense_date` is set
- `receipt_status` is not `required_missing` (either `not_required` or `uploaded`)

**User-facing label:** "Draft"
**Color:** Gray

---

### READY
**Meaning:** The expense is complete and ready to be included in a reimbursement submission.

**Triggers into READY:**
- User manually marks as ready
- System auto-promotes when all required fields are complete and receipt is handled

**Required to leave READY:**
- Must be assigned to a batch
- Batch must be submitted

**User-facing label:** "Ready to Submit"
**Color:** Blue

---

### SUBMITTED
**Meaning:** The expense has been included in a submitted batch and is awaiting review by the employer or client.

**Triggers into SUBMITTED:**
- Parent batch status is set to `submitted`
- User can manually set individual expense to submitted (outside of batch)

**Next states:** `approved`, `rejected`

**User-facing label:** "Submitted"
**Color:** Yellow / Amber

---

### APPROVED
**Meaning:** The employer or client has approved the expense for payment. Money is coming but not yet received.

**Triggers into APPROVED:**
- Parent batch status is set to `approved`
- User manually marks as approved

**Next states:** `paid`

**User-facing label:** "Approved"
**Color:** Green (light)

---

### PAID
**Meaning:** The reimbursement has been received. This expense is fully resolved.

**Triggers into PAID:**
- Parent batch status is set to `paid`
- User manually marks as paid

**Terminal state:** No further status changes expected (can be manually reversed if needed)

**User-facing label:** "Reimbursed"
**Color:** Green (dark / solid)

---

### REJECTED
**Meaning:** The expense was denied. May be due to missing documentation, policy violation, or employer decision.

**Triggers into REJECTED:**
- Parent batch status is set to `rejected` (entire batch)
- User manually marks individual expense as rejected

**Allowed transitions from REJECTED:**
- → DRAFT (user revises the expense)
- → READY (if revision is complete)

**User-facing label:** "Rejected"
**Color:** Red

---

## 3. Receipt Lifecycle

```
Expense created
     │
     ├── User says "No receipt needed"
     │         │
     │         ▼
     │   receipt_status = NOT_REQUIRED
     │   (no warnings, no reminders ever)
     │
     └── Default (receipt expected)
               │
               ▼
         receipt_status = REQUIRED_MISSING
               │
               │ (blocks transition to READY)
               │
               ▼
         User uploads file
               │
               ▼
         receipt_status = UPLOADED
         (expense can now move to READY)
```

### No-Receipt Scenarios (Valid)
The following situations legitimately have no receipt:
- Per diem / daily allowance
- Tips (cash)
- Coin-operated parking
- Small local transport (bus, metro)
- Cash tolls
- Personal cash advances
- Conference registration (confirmation email may substitute)

The system must never nag the user about missing receipts if `receipt_status = not_required`.

---

## 4. Batch-Expense Status Propagation

When a batch changes status, its child expenses inherit the new status:

| Batch Status Change | Expense Status Affected | Action                         |
|---------------------|------------------------|-------------------------------|
| → submitted         | All in batch           | Set to `submitted`             |
| → approved          | All in batch           | Set to `approved`              |
| → paid              | All in batch           | Set to `paid`                  |
| → rejected          | All in batch           | Set to `rejected`              |

**Override rule:** If a user manually changes an individual expense status, it is no longer tied to batch propagation for that status level. The batch still proceeds, but that expense's status is managed independently.

---

## 5. Valid Status Transitions

| From      | To        | Triggered By          | Notes                              |
|-----------|-----------|----------------------|-------------------------------------|
| draft     | ready     | User action / auto   | Receipt must be handled             |
| draft     | submitted | Batch submission     | Skip ready if batch includes draft  |
| ready     | draft     | User action          | User decides to revise              |
| ready     | submitted | Batch submission     | Standard flow                       |
| submitted | approved  | Batch / user action  |                                     |
| submitted | rejected  | Batch / user action  |                                     |
| approved  | paid      | Batch / user action  | Standard flow                       |
| approved  | rejected  | User action          | Rare edge case                      |
| rejected  | draft     | User action          | User revises and starts over        |
| rejected  | ready     | User action          | User has already corrected          |
| paid      | approved  | User action          | Rare — correction                   |

**No other transitions are allowed.**

---

## 6. Dashboard Status Visibility

| Expense Status    | Appears In Dashboard Section         |
|-------------------|--------------------------------------|
| draft             | "Needs Attention" / "Drafts"         |
| ready             | "Ready to Submit"                    |
| submitted         | "Submitted — Awaiting Response"      |
| approved          | "Approved — Not Yet Paid"            |
| paid              | "Completed" (recent history)         |
| rejected          | "Rejected — Requires Action"         |
| required_missing  | "Missing Receipts" alert card        |

---

## 7. Aging Indicators

The system should visually flag stale expenses:

| Condition                                          | Warning                          |
|----------------------------------------------------|----------------------------------|
| Status = draft AND expense_date > 30 days ago      | "Capture is aging"               |
| Status = ready AND expense_date > 14 days ago      | "Ready but not yet submitted"    |
| Status = submitted AND submitted_at > 30 days ago  | "Awaiting response for 30+ days" |
| Status = approved AND approved_at > 14 days ago    | "Approved but not yet paid"      |

These are display indicators only — they do not change status.

---

*Next: See INFORMATION_ARCHITECTURE.md for screen and navigation structure.*
