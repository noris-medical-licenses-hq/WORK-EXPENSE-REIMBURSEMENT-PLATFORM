# Navigation Architecture v1

**Project:** Work Expense Reimbursement Platform  
**Version:** 1.0  
**Date:** 2026-06-20  
**Status:** Approved

---

## 1. Navigation Philosophy

Mobile-first. The primary device is a phone held in one hand.

Rules:
- Primary navigation is always reachable with one thumb
- The add-expense action is always one tap away from anywhere
- No feature should be more than 3 taps from the home screen
- Bottom navigation is the primary nav pattern (not sidebar, not hamburger)

---

## 2. Bottom Navigation Bar

The bottom navigation bar is the primary navigation system on mobile and small screens.

```
┌────────────────────────────────────────────────┐
│                                                │
│              App Content Area                  │
│                                                │
│                                                │
│                                                │
├───────────┬───────────┬───────────┬────────────┤
│  Dashboard│  Expenses │    [+]    │   Trips    │  More
│    🏠     │    📋     │    ➕     │    ✈️      │   ···
└───────────┴───────────┴───────────┴────────────┘
```

### Tab Definitions

| Tab        | Route       | Icon          | Badge                              |
|------------|-------------|---------------|------------------------------------|
| Dashboard  | /           | Home          | Count of action-required items     |
| Expenses   | /expenses   | List          | Count of draft/missing receipt     |
| + (FAB)    | /expenses/new | Plus circle | None (always prominent)            |
| Trips      | /trips      | Plane         | Count of open trips                |
| More       | Sheet/menu  | Dots          | None                               |

### "More" Sheet Contents
- Batches (/batches)
- Import (/import)
- Reports (/reports)
- Settings (/settings)

---

## 3. Desktop Navigation (≥ 768px)

On tablet/desktop, the bottom bar transitions to a left sidebar.

```
┌──────────────┬───────────────────────────────────┐
│              │                                   │
│  Logo        │                                   │
│              │         Content Area              │
│ ──────────── │                                   │
│ 🏠 Dashboard │                                   │
│ 📋 Expenses  │                                   │
│ ✈️ Trips     │                                   │
│ 📦 Batches   │                                   │
│ 📥 Import    │                                   │
│ 📊 Reports   │                                   │
│              │                                   │
│ ──────────── │                                   │
│ ⚙️ Settings  │                                   │
│              │                                   │
└──────────────┴───────────────────────────────────┘
```

The "+" button becomes a fixed floating action button in the bottom-right corner on desktop.

---

## 4. Header / Top Bar

Each screen has a minimal top bar:

```
┌────────────────────────────────────────────────┐
│  ← Back    Screen Title          [action icon] │
└────────────────────────────────────────────────┘
```

- **Back button:** Only on detail/edit screens (not on top-level tabs)
- **Screen title:** Page name (e.g., "Expenses", "New Expense", "Trip: NY May 2026")
- **Action icon (right):** Context-specific (Edit on detail view, Filter on list views, Save on forms)

---

## 5. Routing Map

```
Route                         Component              Auth Required
/                             DashboardPage          Yes
/auth/login                   LoginPage              No
/auth/callback                AuthCallbackPage       No
/expenses                     ExpenseListPage        Yes
/expenses/new                 NewExpensePage         Yes
/expenses/[id]                ExpenseDetailPage      Yes
/expenses/[id]/edit           EditExpensePage        Yes
/trips                        TripListPage           Yes
/trips/new                    NewTripPage            Yes
/trips/[id]                   TripDetailPage         Yes
/trips/[id]/edit              EditTripPage           Yes
/batches                      BatchListPage          Yes
/batches/new                  NewBatchPage           Yes
/batches/[id]                 BatchDetailPage        Yes
/batches/[id]/edit            EditBatchPage          Yes
/import                       ImportStartPage        Yes
/import/[sessionId]           ImportReviewPage       Yes
/import/[sessionId]/complete  ImportCompletePage     Yes
/reports                      ReportsPage            Yes
/reports/by-month             MonthlyReportPage      Yes
/reports/by-category          CategoryReportPage     Yes
/reports/by-trip              TripReportPage         Yes
/reports/by-project           ProjectReportPage      Yes
/settings                     ProfileSettingsPage    Yes
/settings/categories          CategoriesPage         Yes
/settings/payment-methods     PaymentMethodsPage     Yes
/settings/account             AccountSettingsPage    Yes
```

---

## 6. Auth Flow

```
User visits any protected route
         │
         ▼
     Authenticated?
     /     \
   Yes       No
    │         │
    ▼         ▼
  Route    Redirect to /auth/login
  loads         │
               │
               ▼
         Login page
         (Google / Microsoft / Magic Link)
               │
               ▼
         Auth callback (/auth/callback)
               │
               ▼
         Profile exists?
         /           \
       Yes             No (new user)
        │               │
        ▼               ▼
  Redirect to /   Seed default data
                  (categories + payment methods)
                        │
                        ▼
                  Redirect to /
```

---

## 7. Cross-Screen Navigation Patterns

### Expense → Related Entities
From expense detail, tapping trip/batch/category navigates to that entity's detail.

### Batch → Expense
From batch detail, tapping an expense navigates to expense detail with "back to batch" context.

### Dashboard Action Cards
Dashboard action cards are deep links — tapping "4 missing receipts" navigates to `/expenses?filter=missing_receipt`.

### Import → Expense
After import, tapping a transaction navigates to the newly created expense detail.

---

## 8. Navigation Breadcrumbs (Desktop Only)

Desktop view shows breadcrumb at top of content area for deep routes:

```
Expenses > Trip: NY Sales Conference > Expense: Taxi to Airport
```

Mobile: no breadcrumbs. Use back button.

---

## 9. Empty State Navigation

Every list with an empty state includes a primary CTA:

| Screen        | Empty State CTA                  |
|---------------|----------------------------------|
| Expenses      | "Add your first expense"         |
| Trips         | "Create your first trip"         |
| Batches       | "Create a submission batch"      |
| Import        | "Upload a bank or card export"   |
| Reports       | "Add expenses to see reports"    |

---

*Next: See MVP_SCOPE.md for Sprint 1 scope definition.*
