# UX Specifications v1

**Project:** Work Expense Reimbursement Platform  
**Version:** 1.0  
**Date:** 2026-06-20  
**Status:** Approved

---

## 1. Design Principles

### 1.1 Speed Above All
The expense capture flow is the most critical interaction in the product. Every pixel, every tap, every form field that appears by default has a cost. If it is not required for the minimum viable entry, it should be optional and hidden below the fold.

**Target:** User can enter amount, date, and category in under 10 seconds.

### 1.2 Status Is Never Hidden
The reimbursement status of every expense must be immediately visible. Users should never have to open an expense to understand its status.

### 1.3 Action > Information
The dashboard is not a report. It is a to-do list. Every section must drive the user toward an action.

### 1.4 Plain Language
No accounting jargon. No "ledger balance". No "debit/credit". Use the words a person uses when talking to their manager:
- "I paid for this"
- "I submitted this"
- "They approved it"
- "I got reimbursed"

### 1.5 Forgiveness
The system must make it easy to correct mistakes. Status changes, edits, and reassignments should be low-friction, not buried in settings.

---

## 2. Color System

### Status Colors

| Status           | Color       | Tailwind Class   | Meaning            |
|------------------|-------------|------------------|--------------------|
| draft            | Gray        | `text-slate-500` | Incomplete          |
| ready            | Blue        | `text-blue-600`  | Ready to act        |
| submitted        | Amber       | `text-amber-600` | Waiting             |
| approved         | Green light | `text-green-500` | Good news           |
| paid             | Green dark  | `text-green-700` | Done                |
| rejected         | Red         | `text-red-600`   | Action required     |

### Receipt Status Colors

| Status           | Color       | Tailwind Class     |
|------------------|-------------|-------------------|
| not_required     | Gray muted  | `text-slate-400`  |
| required_missing | Orange      | `text-orange-500` |
| uploaded         | Green       | `text-green-500`  |

---

## 3. Typography Scale

| Use                  | Size    | Weight  |
|----------------------|---------|---------|
| Page title           | text-xl | bold    |
| Section heading      | text-lg | semibold|
| Card title / label   | text-sm | medium  |
| Body text            | text-sm | regular |
| Supporting / meta    | text-xs | regular |
| Amount (prominent)   | text-2xl| bold    |

---

## 4. Spacing and Touch Targets

- Minimum touch target: 44px × 44px (Apple HIG standard)
- Card padding: 16px
- Section spacing: 24px between sections
- Form field spacing: 16px between fields
- Bottom nav height: 64px
- FAB size: 56px diameter

---

## 5. Key Component Specifications

### 5.1 Expense Card
Used in lists throughout the app.

```
┌──────────────────────────────────────────────┐
│  [Category Icon]  Taxi to Airport      [$]   │
│                   Jun 20, 2026               │
│  [Payment icon]   Credit Card  [Status badge]│
└──────────────────────────────────────────────┘
```

- Category icon (colored dot or emoji)
- Title (truncated at 1 line)
- Amount (right-aligned, bold, currency symbol)
- Date (small, below title)
- Status badge (right side, pill shape)
- Receipt indicator (small icon if receipt missing and required)

**Touch behavior:** Tap → Expense Detail

### 5.2 Status Badge

```
┌──────────────┐
│ ● Ready      │  Blue pill
└──────────────┘

┌──────────────┐
│ ● Submitted  │  Amber pill
└──────────────┘
```

### 5.3 Amount Input (New Expense)

The amount input is the hero element on the new expense screen.

```
┌────────────────────────────────────────┐
│                                        │
│           $ 1,250.00                   │
│                                        │
│  [USD ▼]                               │
│                                        │
└────────────────────────────────────────┘
```

- Large font (text-4xl or larger)
- Number keypad auto-opens on mobile
- Currency selector adjacent (defaults to user's default)
- Decimal handling: comma/period based on locale

### 5.4 Quick Category Selector

Below the amount input — the most recently used categories appear as chips:

```
[🍽️ Meals] [🚗 Transport] [✈️ Flights] [🏨 Hotel] [+ More]
```

- 4 recent categories visible
- "More" opens full category picker
- Each chip is a tap target (not a dropdown)

### 5.5 Dashboard Action Card

```
┌──────────────────────────────────────────────────┐
│  ⚠️  4 expenses missing receipts                  │
│     Oldest: Jun 15, 2026                         │
│                            [Review Now →]         │
└──────────────────────────────────────────────────┘
```

- Icon indicates urgency level
- Description of the issue
- Count and/or date context
- CTA button that deep-links to the filtered view

### 5.6 Bottom Navigation

```
┌──────────────────────────────────────────────────┐
│  🏠        📋       ➕       ✈️        ···       │
│ Home    Expenses  (FAB)   Trips      More        │
│   3                         1                    │
└──────────────────────────────────────────────────┘
```

- Active tab: colored icon + label
- Inactive tabs: muted icon + label
- Badges show counts (only when > 0)
- FAB: larger, primary color, no label

---

## 6. Empty States

Every list screen has a tailored empty state:

| Screen         | Illustration (future) | Heading                | CTA               |
|----------------|----------------------|------------------------|-------------------|
| Expenses       | Receipt with +       | No expenses yet        | Add First Expense |
| Trips          | Suitcase             | No trips yet           | Create a Trip     |
| Batches        | Package              | No batches yet         | Create a Batch    |
| Import         | Upload arrow         | Import from your bank  | Upload File       |
| Reports        | Chart                | Add expenses to see reports | Add Expense  |

---

## 7. Error and Feedback States

### Form Validation
- Inline, below the field
- Red color for errors
- Plain language: "Amount must be greater than zero" not "Invalid amount"

### API Errors
- Toast notification (top of screen, non-blocking)
- "Something went wrong — try again" with retry action
- Never show raw error messages or technical details

### Success Feedback
- Toast for most actions ("Expense saved", "Receipt uploaded", "Batch submitted")
- No toast for navigation actions (tapping a tab, opening a detail)

### Loading States
- Skeleton screens for lists (not spinners)
- Spinner for form submissions only
- Optimistic updates where safe (status badge changes immediately)

---

## 8. Mobile-Specific Considerations

### Safe Areas
- Bottom padding accounts for iPhone home indicator (env(safe-area-inset-bottom))
- Bottom nav sits above the home indicator area

### Input Behavior
- Amount field: triggers `type="decimal"` input mode for numeric keyboard
- Date field: native date picker on mobile
- Text fields: standard keyboard

### Image Upload
- On iOS: triggers native photo picker with camera/gallery options
- On Android: triggers file picker with camera intent
- Web fallback: `<input type="file" accept="image/*,application/pdf">`

### Offline Consideration (Future)
- v1: No offline support — graceful error message when network unavailable
- v2: Draft expenses cached locally, sync when online

---

## 9. Accessibility Standards (Minimum)

- All interactive elements have `aria-label`
- All images have `alt` text
- Color is never the sole indicator of meaning (always paired with text or icon)
- Minimum contrast ratio: 4.5:1 for body text
- Focus visible on all interactive elements
- Form inputs have associated labels

---

## 10. Performance Targets (UX Impact)

| Metric                    | Target  |
|---------------------------|---------|
| Dashboard initial load    | < 2s    |
| Expense list scroll       | 60fps   |
| New expense form open     | < 200ms |
| Receipt upload feedback   | < 500ms (progress starts) |
| Status change feedback    | Instant (optimistic) |

---

*Refer to NAVIGATION_ARCHITECTURE.md for routing and INFORMATION_ARCHITECTURE.md for screen content.*
