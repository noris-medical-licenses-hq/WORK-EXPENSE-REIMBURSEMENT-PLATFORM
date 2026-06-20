# Sprint 4: Settings, Expense Edit, Filters, Trips & Batches

**Project:** Work Expense Reimbursement Platform  
**Sprint:** 4  
**Goal:** Complete the MVP — every screen has real data, users can manage their profile and reference data

---

## Sprint Goal

At the end of Sprint 4:
1. User can edit their profile (name, default currency)
2. User can manage expense categories (view, rename, reorder)
3. User can manage payment methods (add, edit, remove)
4. User can edit an existing expense
5. User can filter expenses by status
6. Trip list shows real data (create, view trips)
7. Batch list shows real data (create, view batches)
8. Receipt "not required" action available on expense detail
9. All 12+ screens have real data — no "coming soon" placeholders

---

## Sprint 4 Scope

### 1. Settings Page
- [ ] ProfileSettingsShell — real form (full_name, default_currency)
- [ ] CategoriesManager — list + toggle active/inactive
- [ ] PaymentMethodsManager — list + add (name, type, last_four)
- [ ] Navigation tabs: Profile / Categories / Payment Methods

### 2. Expense Editing
- [ ] Edit expense form (same fields as NewExpenseForm, pre-filled)
- [ ] Edit button on ExpenseDetailShell
- [ ] ExpenseRepository.update() called via ExpenseService.update()

### 3. Expense Filters
- [ ] Status filter tabs on ExpenseListShell (All / Pending / Submitted / Approved)
- [ ] Filter persists in URL search params
- [ ] Receipt filter: "Missing receipts" quick filter

### 4. Trip CRUD
- [ ] Trip list with real data (TripListShell)
- [ ] New Trip form (name, destination, client, start/end dates)
- [ ] Trip detail page (expenses linked to trip)

### 5. Batch CRUD
- [ ] Batch list with real data (BatchListShell)
- [ ] New Batch form (name, description)
- [ ] Batch detail page (expenses in batch)

### 6. Receipt "Not Required" Action
- [ ] Button on ExpenseDetailShell to mark receipt as not_required
- [ ] Clears the "missing receipt" alert on expense card

---

## Definition of Done — Sprint 4

- [ ] `npm run build` zero errors
- [ ] `npx tsc --noEmit` zero errors
- [ ] All screens render real data from Supabase
- [ ] No "coming soon" placeholder text remains
- [ ] User can complete full expense lifecycle: create → upload receipt → mark ready → submit
- [ ] Settings page allows profile update
- [ ] Categories and payment methods manageable

---

## Not in Sprint 4

- Import engine (bank CSV / PDF parsing)
- OCR / AI features
- Approval workflow (multi-person)
- Advanced reporting
- Email notifications
- Export to CSV/PDF
