# QA Standards v1

**Project:** Work Expense Reimbursement Platform  
**Version:** 1.0  
**Date:** 2026-06-20  
**Status:** Approved

---

## 1. Testing Philosophy

The goal is not 100% code coverage. The goal is confidence that the product works correctly for its core user flows.

**Testing priority order:**
1. Critical user paths (expense capture, status transitions, batch management)
2. Business rule validation (status transitions, receipt requirements)
3. Data access layer (repository functions)
4. UI component rendering

**Not a priority for v1:**
- Snapshot testing
- E2E for every possible edge case
- Visual regression testing

---

## 2. Test Types and Coverage Targets

| Layer          | Test Type    | Coverage Target | Framework         |
|----------------|--------------|----------------|-------------------|
| Service Layer  | Unit         | 80% +          | Jest / Vitest     |
| Repository Layer | Integration | 70% +          | Jest + Supabase   |
| Business Rules | Unit         | 100%           | Jest / Vitest     |
| Status Transitions | Unit     | 100%           | Jest / Vitest     |
| Components     | Render tests | 50% +          | React Testing Library |
| Critical paths | E2E          | Key flows only | Playwright (future)|

---

## 3. Critical Paths That Must Always Pass

The following scenarios must have explicit test coverage:

### Expense Management
- [ ] Create expense with minimum required fields (amount, date)
- [ ] Create expense with all fields populated
- [ ] Update expense fields
- [ ] Soft delete expense (verify it does not appear in queries)
- [ ] Restore soft-deleted expense (verify `deleted_at = null`)
- [ ] Receipt upload updates `receipt_status` to `uploaded`
- [ ] Marking "no receipt needed" sets `receipt_status = not_required`

### Status Transitions
- [ ] `draft` → `ready` is allowed when receipt is handled
- [ ] `draft` → `ready` is BLOCKED when receipt is missing
- [ ] `ready` → `submitted` is allowed
- [ ] `submitted` → `approved` is allowed
- [ ] `approved` → `paid` is allowed
- [ ] `submitted` → `rejected` is allowed
- [ ] `rejected` → `draft` is allowed
- [ ] `paid` → `draft` is NOT allowed (hard rule)
- [ ] Invalid transitions throw `InvalidStatusTransitionError`

### Batch Management
- [ ] Creating a batch and assigning expenses
- [ ] Submitting batch sets all assigned expenses to `submitted`
- [ ] Approving batch sets all assigned expenses to `approved`
- [ ] Paying batch sets all assigned expenses to `paid`
- [ ] Batch total is correctly computed (sum of expense amounts)
- [ ] Rejecting batch sets assigned expenses to `rejected`

### Import Engine
- [ ] CSV file with valid format is parsed correctly
- [ ] Duplicate detection catches same-amount + same-date transaction
- [ ] User skips a transaction — it is not imported
- [ ] Successful import creates expenses with `draft` status
- [ ] Failed import does not create partial expenses

### Authentication
- [ ] Unauthenticated user is redirected to /auth/login
- [ ] Authenticated user's data is isolated from other users
- [ ] Profile is created on first login

---

## 4. Service Layer Test Pattern

All service functions must have unit tests that mock the repository layer.

```typescript
// expense.service.test.ts
describe('ExpenseService', () => {
  describe('markAsReady', () => {
    it('should transition draft expense to ready when receipt is uploaded', async () => {
      const mockExpense = buildExpense({ 
        reimbursement_status: 'draft',
        receipt_status: 'uploaded'
      });
      mockRepository.findById.mockResolvedValue(mockExpense);
      
      const result = await ExpenseService.markAsReady(mockExpense.id);
      
      expect(result.reimbursement_status).toBe('ready');
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockExpense.id,
        { reimbursement_status: 'ready' }
      );
    });

    it('should throw when expense has required_missing receipt', async () => {
      const mockExpense = buildExpense({
        reimbursement_status: 'draft',
        receipt_status: 'required_missing'
      });
      mockRepository.findById.mockResolvedValue(mockExpense);

      await expect(ExpenseService.markAsReady(mockExpense.id))
        .rejects.toThrow(ExpenseValidationError);
    });
  });
});
```

---

## 5. Repository Layer Test Pattern

Repository tests use a test Supabase project (or local Supabase).

```typescript
// expense.repository.test.ts
describe('ExpenseRepository', () => {
  beforeEach(async () => {
    await seedTestUser();
    await clearExpenses(testUserId);
  });

  it('should not return soft-deleted expenses', async () => {
    const expense = await createTestExpense({ user_id: testUserId });
    await ExpenseRepository.softDelete(expense.id);
    
    const expenses = await ExpenseRepository.findByUser(testUserId);
    
    expect(expenses.find(e => e.id === expense.id)).toBeUndefined();
  });
});
```

---

## 6. Component Test Pattern

Components are tested for correct rendering of props and basic interactions.

```typescript
// ExpenseStatusBadge.test.tsx
describe('ExpenseStatusBadge', () => {
  it('renders "Ready to Submit" for ready status', () => {
    render(<ExpenseStatusBadge status="ready" />);
    expect(screen.getByText('Ready to Submit')).toBeInTheDocument();
  });

  it('renders with correct color class for rejected status', () => {
    render(<ExpenseStatusBadge status="rejected" />);
    expect(screen.getByTestId('status-badge')).toHaveClass('text-red-600');
  });
});
```

---

## 7. Test File Organization

```
src/
  lib/
    services/
      __tests__/
        expense.service.test.ts
        batch.service.test.ts
        import.service.test.ts
    repositories/
      __tests__/
        expense.repository.test.ts
  components/
    expenses/
      __tests__/
        ExpenseCard.test.tsx
        ExpenseForm.test.tsx
        ExpenseStatusBadge.test.tsx
```

Test files live next to the code they test inside `__tests__/` folders.

---

## 8. Test Data Builders

Use factory functions (not hardcoded fixtures) for test data:

```typescript
// test/builders.ts
export function buildExpense(overrides?: Partial<Expense>): Expense {
  return {
    id: 'test-expense-id',
    user_id: 'test-user-id',
    title: 'Test Expense',
    amount: 100,
    currency: 'USD',
    expense_date: '2026-06-20',
    receipt_status: 'required_missing',
    reimbursement_status: 'draft',
    is_personal: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  };
}
```

---

## 9. Pre-Merge QA Checklist

Before merging any feature branch:

**Code:**
- [ ] TypeScript compiles without errors (`tsc --noEmit`)
- [ ] ESLint passes with no errors
- [ ] All tests pass (`npm test`)

**Functionality:**
- [ ] Feature works on mobile viewport (375px)
- [ ] Feature works on desktop viewport (1280px)
- [ ] Happy path tested manually
- [ ] Error states tested manually (what happens if the API call fails?)
- [ ] Empty states render correctly

**Data:**
- [ ] No new table is missing RLS policy
- [ ] Soft delete is applied where required
- [ ] New queries include `deleted_at IS NULL`

**Security:**
- [ ] No service_role key used in frontend code
- [ ] No unvalidated user input passed to database queries
- [ ] File uploads validate type and size before accepting

---

## 10. Performance QA

Before launch and after major features:

- [ ] Dashboard load time < 2s on slow 3G (Lighthouse)
- [ ] New expense form interaction time < 100ms
- [ ] List pages paginate or virtualize beyond 50 items
- [ ] Receipt upload shows progress indicator (not frozen UI)

---

*See DEVELOPMENT_STANDARDS.md for code standards and commit conventions.*
