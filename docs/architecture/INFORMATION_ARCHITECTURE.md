# Information Architecture v1

**Project:** Work Expense Reimbursement Platform  
**Version:** 1.0  
**Date:** 2026-06-20  
**Status:** Approved

---

## 1. Site Map

```
/
├── /auth
│   ├── /login
│   └── /callback
│
├── / (Dashboard)                    ← Protected, authenticated only
│   └── Default route after login
│
├── /expenses
│   ├── / (Expense List)
│   ├── /new (New Expense)
│   ├── /[id] (Expense Detail)
│   └── /[id]/edit (Edit Expense)
│
├── /trips
│   ├── / (Trip List)
│   ├── /new (New Trip)
│   ├── /[id] (Trip Detail + Expenses)
│   └── /[id]/edit (Edit Trip)
│
├── /batches
│   ├── / (Batch List)
│   ├── /new (New Batch)
│   ├── /[id] (Batch Detail + Expenses)
│   └── /[id]/edit (Edit Batch)
│
├── /import
│   ├── / (Import Start)
│   ├── /[sessionId] (Review Session)
│   └── /[sessionId]/complete (Import Complete)
│
├── /reports
│   ├── / (Reports Overview)
│   ├── /by-month
│   ├── /by-category
│   ├── /by-trip
│   └── /by-project
│
└── /settings
    ├── / (Profile)
    ├── /categories
    ├── /payment-methods
    └── /account
```

---

## 2. Screen Inventory

### 2.1 Dashboard (/)

**Purpose:** Operational control center — answer "what needs my attention right now?"

**Primary content blocks:**
1. **Action Required** — expenses needing attention (missing receipts, drafts aging, rejected)
2. **Status Summary** — count + amount by status (draft, ready, submitted, approved)
3. **Open Batches** — batches not yet paid (submitted, approved)
4. **Open Trips** — trips with unreimbursed expenses
5. **Recent Activity** — last 5-10 expense events

**Secondary content:**
- Quick-add expense button (always visible)
- Monthly total at a glance

**Does NOT contain:**
- Complex charts (v1)
- Budget tracking
- Analytics

---

### 2.2 Expense List (/expenses)

**Purpose:** Full expense ledger with filtering and search.

**Features:**
- Filter by: status, date range, category, trip, batch, payment method
- Sort by: date, amount, status
- Search by: title, vendor name
- Bulk actions: assign to batch, change status
- Grouping: by month (default), by trip, by batch

**Empty state:** "No expenses found. Tap + to add your first expense."

---

### 2.3 New Expense (/expenses/new)

**Purpose:** Fast expense capture — the most critical screen in the product.

**Minimum required fields (fast capture mode):**
1. Amount (number keypad, prominent)
2. Currency (defaults to user's default)
3. Date (defaults to today)
4. Category (defaults to last used)

**Additional fields (shown below fold / expand):**
- Title / Description
- Vendor name
- Payment method
- Trip assignment
- Project assignment
- Notes
- Receipt (upload prompt)
- Receipt status (toggle: "No receipt needed")

**Design constraints:**
- Amount input is the first focused element
- Submit is reachable without scrolling on mobile
- No required fields beyond amount + date

---

### 2.4 Expense Detail (/expenses/[id])

**Purpose:** Full view of a single expense. Action hub.

**Content:**
- All expense fields displayed
- Receipt thumbnails / file list
- Status badge with history (future)
- Current batch / trip / project links
- Action buttons: Edit, Add Receipt, Change Status, Delete
- Aging indicator if applicable

---

### 2.5 Edit Expense (/expenses/[id]/edit)

**Purpose:** Modify any field of an existing expense.

**Constraints:**
- Paid expenses can only be edited by explicitly "unlocking" them (single confirm tap)
- Submitted expenses show a warning but are editable

---

### 2.6 Trip List (/trips)

**Purpose:** Overview of all trips with status and financial summary.

**Content:**
- Trip cards: name, destination, date range, expense count, total amount, status
- Filter: active / planning / completed
- Sort: date, amount

---

### 2.7 Trip Detail (/trips/[id])

**Purpose:** All expenses for this trip + trip summary.

**Content:**
- Trip metadata
- Total expenses (by status breakdown)
- Expense list (same component as expense list, filtered)
- Action: Add expense to trip, Edit trip, Complete trip

---

### 2.8 Batch List (/batches)

**Purpose:** Overview of all submission batches.

**Content:**
- Batch cards: name, date, expense count, total amount, status
- Open batches first
- Status pipeline view

---

### 2.9 Batch Detail (/batches/[id])

**Purpose:** Manage a submission batch — assign expenses, track status.

**Content:**
- Batch metadata
- Status timeline (submitted → approved → paid)
- Expense list in this batch
- Action: Add expenses, Submit batch, Mark approved, Mark paid, Export PDF/CSV

---

### 2.10 Import (/import)

**Purpose:** Bulk import from bank/card exports.

**Flow:**
1. File upload screen (drag and drop + file picker)
2. Parsing feedback ("Found 23 transactions")
3. Review table (each transaction: date, merchant, amount, action: import/skip/duplicate?)
4. Confirmation screen ("18 imported, 3 skipped, 2 already exist")

---

### 2.11 Reports (/reports)

**Purpose:** Summaries by time period, category, trip, project.

**By Month:**
- Month selector
- Breakdown by category
- Status breakdown (what was paid vs. pending)

**By Category:**
- Category totals
- Trend over time

**By Trip / Project:**
- Per trip/project totals

---

### 2.12 Settings

**Profile (/settings):** Name, email, default currency, avatar

**Categories (/settings/categories):** Add, edit, reorder, hide default categories

**Payment Methods (/settings/payment-methods):** Add, edit, set default, archive

**Account (/settings/account):** Sign out, data export (future), account deletion (future)

---

## 3. Content Hierarchy by Importance

| Priority | Screen           | Reason                              |
|----------|------------------|-------------------------------------|
| 1        | New Expense      | Core capture action                 |
| 2        | Dashboard        | Operational awareness               |
| 3        | Expense List     | Primary data view                   |
| 4        | Expense Detail   | Action hub                          |
| 5        | Batch Detail     | Submission management               |
| 6        | Import           | Bulk capture efficiency             |
| 7        | Trip Detail      | Travel management                   |
| 8        | Reports          | Historical awareness                |
| 9        | Settings         | Configuration                       |

---

## 4. Data Entry Principles

### Fast Capture Rules
- Amount: large number input, immediately focused
- Date: default today, tap to change
- Category: recent categories shown first
- No required field should require typing (except amount)

### Progressive Disclosure Rules
- Vendor name: optional, shown below fold
- Trip/project: optional, shown below fold
- Notes: optional, collapsed by default
- Advanced status controls: on detail view only

---

*Next: See NAVIGATION_ARCHITECTURE.md for navigation structure and routing.*
