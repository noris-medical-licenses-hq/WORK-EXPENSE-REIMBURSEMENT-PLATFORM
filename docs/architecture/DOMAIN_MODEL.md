# Domain Model v1

**Project:** Work Expense Reimbursement Platform  
**Version:** 1.0  
**Date:** 2026-06-20  
**Status:** Approved

---

## 1. Domain Overview

The domain is centered on the **Expense** entity. All other entities exist to organize, track, or enrich expenses.

```
                        ┌──────────────┐
                        │    Profile   │ (extends Supabase auth.users)
                        └──────┬───────┘
                               │ owns
              ┌────────────────┼──────────────────────┐
              │                │                      │
       ┌──────▼──────┐  ┌──────▼──────┐   ┌──────────▼────────┐
       │    Trip      │  │   Project   │   │ ReimbursementBatch │
       └──────┬───────┘  └──────┬──────┘   └──────────┬────────┘
              │                 │                      │
              └────────┬────────┘                      │
                       │ optional containers            │
                  ┌────▼────┐                          │
                  │ EXPENSE │◄─────────────────────────┘
                  └────┬────┘  optional batch assignment
                       │
           ┌───────────┼───────────┐
           │           │           │
     ┌─────▼───┐ ┌─────▼────┐ ┌───▼──────────┐
     │ Receipt │ │ Category  │ │PaymentMethod │
     └─────────┘ └──────────┘ └──────────────┘
```

---

## 2. Entity Definitions

### 2.1 Profile

Extends `auth.users` with application-specific fields.

| Field            | Type      | Required | Notes                        |
|------------------|-----------|----------|------------------------------|
| id               | uuid      | Yes      | FK to auth.users.id          |
| full_name        | text      | No       | Display name                 |
| email            | text      | Yes      | From auth.users              |
| avatar_url       | text      | No       | From OAuth provider          |
| default_currency | text      | Yes      | ISO 4217 code (default: USD) |
| created_at       | timestamp | Yes      | Auto                         |
| updated_at       | timestamp | Yes      | Auto                         |

---

### 2.2 Expense *(Primary Entity)*

The core unit of the system. Every other entity exists to support this one.

| Field                | Type      | Required | Notes                                              |
|----------------------|-----------|----------|----------------------------------------------------|
| id                   | uuid      | Yes      | PK                                                 |
| user_id              | uuid      | Yes      | FK to profiles.id, RLS enforced                    |
| title                | text      | Yes      | Short description (e.g., "Taxi to Airport")        |
| description          | text      | No       | Extended notes                                     |
| amount               | numeric   | Yes      | Positive value                                     |
| currency             | text      | Yes      | ISO 4217 (e.g., USD, EUR, ILS)                    |
| expense_date         | date      | Yes      | When the expense occurred                          |
| vendor_name          | text      | No       | Merchant or payee name                             |
| vendor_country       | text      | No       | ISO 3166-1 alpha-2 country code                    |
| category_id          | uuid      | No       | FK to expense_categories                           |
| payment_method_id    | uuid      | No       | FK to payment_methods                              |
| trip_id              | uuid      | No       | FK to trips (optional)                             |
| project_id           | uuid      | No       | FK to projects (optional)                          |
| batch_id             | uuid      | No       | FK to reimbursement_batches (optional)             |
| receipt_status       | enum      | Yes      | not_required / required_missing / uploaded         |
| reimbursement_status | enum      | Yes      | draft / ready / submitted / approved / paid / rejected |
| notes                | text      | No       | Free-form notes                                    |
| is_personal          | boolean   | Yes      | False = reimbursable, True = personal (tracking only) |
| created_at           | timestamp | Yes      | Auto                                               |
| updated_at           | timestamp | Yes      | Auto                                               |
| deleted_at           | timestamp | No       | Soft delete                                        |

**Business Rules:**
- `amount` must be > 0
- `expense_date` cannot be in the future by more than 1 day (tolerance for timezone)
- If `receipt_status = not_required`, no receipt warnings are shown
- If `receipt_status = required_missing`, the expense cannot move to `ready` status
- An expense assigned to a `batch_id` follows the batch's status from `submitted` onward
- `deleted_at` is set on soft delete; null means active

---

### 2.3 Receipt

A file attachment proving an expense occurred.

| Field       | Type      | Required | Notes                                  |
|-------------|-----------|----------|----------------------------------------|
| id          | uuid      | Yes      | PK                                     |
| expense_id  | uuid      | Yes      | FK to expenses                         |
| user_id     | uuid      | Yes      | RLS enforced                           |
| file_path   | text      | Yes      | Supabase Storage path                  |
| file_name   | text      | Yes      | Original filename                      |
| file_type   | text      | Yes      | MIME type (image/jpeg, image/png, application/pdf) |
| file_size   | integer   | Yes      | Bytes                                  |
| ocr_raw     | jsonb     | No       | Reserved for future OCR data           |
| uploaded_at | timestamp | Yes      | When file was uploaded                 |
| created_at  | timestamp | Yes      | Auto                                   |

**Business Rules:**
- One expense can have multiple receipts
- Maximum file size: 10MB per receipt
- Accepted types: JPEG, PNG, WEBP, PDF
- When any receipt is uploaded, parent expense `receipt_status` is set to `uploaded`

---

### 2.4 ExpenseCategory

User-configurable categories for organizing expenses.

| Field      | Type      | Required | Notes                              |
|------------|-----------|----------|------------------------------------|
| id         | uuid      | Yes      | PK                                 |
| user_id    | uuid      | Yes      | RLS enforced                       |
| name       | text      | Yes      | e.g., "Meals", "Transportation"    |
| icon       | text      | No       | Icon identifier (emoji or icon key)|
| color      | text      | No       | Hex color code                     |
| is_default | boolean   | Yes      | System-seeded categories           |
| is_active  | boolean   | Yes      | Soft archive                       |
| sort_order | integer   | Yes      | Display order                      |
| created_at | timestamp | Yes      | Auto                               |

**Default categories (seeded on registration):**
- Meals & Dining
- Transportation
- Accommodation
- Flights
- Parking
- Fuel
- Equipment
- Office Supplies
- Conference & Events
- Client Entertainment
- Telecommunications
- Other

---

### 2.5 PaymentMethod

How the expense was paid.

| Field      | Type      | Required | Notes                                              |
|------------|-----------|----------|----------------------------------------------------|
| id         | uuid      | Yes      | PK                                                 |
| user_id    | uuid      | Yes      | RLS enforced                                       |
| name       | text      | Yes      | Display name (e.g., "Corporate Visa ending 4242")  |
| type       | enum      | Yes      | credit_card / debit_card / cash / bank_transfer / paypal / apple_pay / google_pay / other |
| last_four  | text      | No       | Last 4 digits for cards                            |
| is_default | boolean   | Yes      | Default selection on new expenses                  |
| is_active  | boolean   | Yes      | Soft archive                                       |
| created_at | timestamp | Yes      | Auto                                               |

**Default payment methods (seeded on registration):**
- Cash
- Credit Card
- Other

---

### 2.6 Trip

An optional organizational container for travel-related expenses.

| Field       | Type      | Required | Notes                                           |
|-------------|-----------|----------|-------------------------------------------------|
| id          | uuid      | Yes      | PK                                              |
| user_id     | uuid      | Yes      | RLS enforced                                    |
| name        | text      | Yes      | e.g., "NY Sales Conference May 2026"            |
| destination | text      | No       | City, country, or region                        |
| client      | text      | No       | Client or host name                             |
| start_date  | date      | No       | Trip start                                      |
| end_date    | date      | No       | Trip end                                        |
| status      | enum      | Yes      | planning / active / completed / cancelled       |
| notes       | text      | No       | Free-form                                       |
| created_at  | timestamp | Yes      | Auto                                            |
| updated_at  | timestamp | Yes      | Auto                                            |
| deleted_at  | timestamp | No       | Soft delete                                     |

**Business Rules:**
- A trip is "open" if it has expenses with `reimbursement_status` != paid
- Deleting a trip does NOT delete its expenses (null out trip_id on expenses)

---

### 2.7 Project

An optional organizational container for project-based reimbursements.

| Field       | Type      | Required | Notes                               |
|-------------|-----------|----------|-------------------------------------|
| id          | uuid      | Yes      | PK                                  |
| user_id     | uuid      | Yes      | RLS enforced                        |
| name        | text      | Yes      | e.g., "Office Relocation Q2 2026"   |
| description | text      | No       | Purpose or scope                    |
| client      | text      | No       | Associated client                   |
| status      | enum      | Yes      | active / completed / archived       |
| created_at  | timestamp | Yes      | Auto                                |
| updated_at  | timestamp | Yes      | Auto                                |
| deleted_at  | timestamp | No       | Soft delete                         |

---

### 2.8 ReimbursementBatch

Tracks a submission cycle — a group of expenses submitted together for reimbursement.

| Field        | Type      | Required | Notes                                             |
|--------------|-----------|----------|---------------------------------------------------|
| id           | uuid      | Yes      | PK                                                |
| user_id      | uuid      | Yes      | RLS enforced                                      |
| name         | text      | Yes      | e.g., "May 2026 Expenses"                         |
| description  | text      | No       | Optional context                                  |
| status       | enum      | Yes      | draft / submitted / approved / paid / rejected    |
| submitted_at | timestamp | No       | When submitted to employer/client                 |
| approved_at  | timestamp | No       | When approved                                     |
| paid_at      | timestamp | No       | When payment received                             |
| notes        | text      | No       | Free-form                                         |
| created_at   | timestamp | Yes      | Auto                                              |
| updated_at   | timestamp | Yes      | Auto                                              |

**Business Rules:**
- `total_amount` is a computed view (sum of assigned expenses), not stored
- When batch moves to `submitted`, all assigned expenses move to `submitted`
- When batch moves to `paid`, all assigned expenses move to `paid`
- A batch can be rejected partially — individual expenses track their own status

---

### 2.9 ImportSession

Tracks a file import attempt.

| Field             | Type      | Required | Notes                                            |
|-------------------|-----------|----------|--------------------------------------------------|
| id                | uuid      | Yes      | PK                                               |
| user_id           | uuid      | Yes      | RLS enforced                                     |
| file_name         | text      | Yes      | Original filename                                |
| file_type         | text      | Yes      | CSV, XLSX, etc.                                  |
| status            | enum      | Yes      | pending / processing / review / completed / failed |
| raw_data          | jsonb     | No       | Stored parsed content                            |
| transaction_count | integer   | No       | Total transactions found                         |
| imported_count    | integer   | No       | Successfully imported                            |
| skipped_count     | integer   | No       | User-skipped                                     |
| error_message     | text      | No       | Error detail if failed                           |
| created_at        | timestamp | Yes      | Auto                                             |
| completed_at      | timestamp | No       | When user finished review                        |

---

### 2.10 ImportTransaction

An individual transaction from an import session, pending user review.

| Field               | Type      | Required | Notes                                   |
|---------------------|-----------|----------|-----------------------------------------|
| id                  | uuid      | Yes      | PK                                      |
| session_id          | uuid      | Yes      | FK to import_sessions                   |
| user_id             | uuid      | Yes      | RLS enforced                            |
| raw_date            | text      | No       | As parsed from file                     |
| raw_amount          | text      | No       | As parsed from file                     |
| raw_currency        | text      | No       | As parsed from file                     |
| raw_merchant        | text      | No       | As parsed from file                     |
| raw_description     | text      | No       | As parsed from file                     |
| mapped_expense_id   | uuid      | No       | If imported, FK to expenses             |
| status              | enum      | Yes      | pending / imported / skipped / duplicate |
| duplicate_of_id     | uuid      | No       | If duplicate detected, FK to expenses   |
| duplicate_score     | integer   | No       | 0-100 confidence of duplicate           |
| created_at          | timestamp | Yes      | Auto                                    |

---

## 3. Aggregate Boundaries

| Aggregate Root     | Contains                            |
|--------------------|-------------------------------------|
| Expense            | Receipt (owned, not shared)         |
| Trip               | Reference to Expenses (not owned)   |
| Project            | Reference to Expenses (not owned)   |
| ReimbursementBatch | Reference to Expenses (not owned)   |
| ImportSession      | ImportTransaction (owned)           |

Receipts are the only truly owned sub-entity. All other associations are loose references via foreign keys.

---

## 4. Status Enumerations

### 4.1 ReimbursementStatus
```
draft → ready → submitted → approved → paid
                    ↓
                rejected
```

| Status    | Meaning                                         |
|-----------|-------------------------------------------------|
| draft     | Captured, incomplete or not ready to submit     |
| ready     | Complete, ready to be included in a batch       |
| submitted | Included in a submitted batch                   |
| approved  | Employer/client approved for payment            |
| paid      | Money received                                  |
| rejected  | Denied — may be revised and resubmitted         |

### 4.2 ReceiptStatus
| Status           | Meaning                                     |
|------------------|---------------------------------------------|
| not_required     | No receipt expected (cash, per diem, etc.)  |
| required_missing | Receipt needed but not yet uploaded         |
| uploaded         | At least one receipt file attached          |

### 4.3 TripStatus
| Status    | Meaning                |
|-----------|------------------------|
| planning  | Future trip            |
| active    | Currently traveling    |
| completed | Trip finished          |
| cancelled | Trip did not happen    |

### 4.4 BatchStatus
| Status    | Meaning                              |
|-----------|--------------------------------------|
| draft     | Building the submission              |
| submitted | Sent to employer/client              |
| approved  | Approved for payment                 |
| paid      | Funds received                       |
| rejected  | Denied                               |

---

*Next: See ENTITY_RELATIONSHIP_MODEL.md for database relationships.*
