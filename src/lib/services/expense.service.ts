import { ExpenseRepository } from "@/lib/repositories/expense.repository";
import { VALID_STATUS_TRANSITIONS } from "@/lib/constants/status";
import type {
  Expense,
  ExpenseFormValues,
  ReimbursementStatus,
} from "@/lib/types/expense.types";

export class ExpenseValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = "ExpenseValidationError";
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(from: ReimbursementStatus, to: ReimbursementStatus) {
    super(`Cannot transition from "${from}" to "${to}"`);
    this.name = "InvalidStatusTransitionError";
  }
}

export class ExpenseService {
  static async create(
    userId: string,
    values: ExpenseFormValues
  ): Promise<Expense> {
    if (!values.title || values.title.trim().length === 0) {
      throw new ExpenseValidationError("Title is required", "title");
    }
    if (values.amount <= 0) {
      throw new ExpenseValidationError(
        "Amount must be greater than zero",
        "amount"
      );
    }
    if (!values.currency || values.currency.length !== 3) {
      throw new ExpenseValidationError("Valid currency is required", "currency");
    }
    if (!values.expense_date) {
      throw new ExpenseValidationError("Date is required", "expense_date");
    }

    return ExpenseRepository.create({
      user_id: userId,
      title: values.title.trim(),
      description: values.description ?? null,
      amount: values.amount,
      currency: values.currency.toUpperCase(),
      expense_date: values.expense_date,
      vendor_name: values.vendor_name ?? null,
      vendor_country: values.vendor_country ?? null,
      category_id: values.category_id ?? null,
      payment_method_id: values.payment_method_id ?? null,
      trip_id: values.trip_id ?? null,
      project_id: values.project_id ?? null,
      batch_id: values.batch_id ?? null,
      receipt_status: values.receipt_status,
      reimbursement_status: "draft",
      is_personal: values.is_personal,
      notes: values.notes ?? null,
    });
  }

  static async update(
    id: string,
    userId: string,
    values: Partial<ExpenseFormValues>
  ): Promise<Expense> {
    if (values.amount !== undefined && values.amount <= 0) {
      throw new ExpenseValidationError(
        "Amount must be greater than zero",
        "amount"
      );
    }

    return ExpenseRepository.update(id, userId, {
      ...values,
      title: values.title?.trim(),
      currency: values.currency?.toUpperCase(),
    });
  }

  static async changeStatus(
    id: string,
    userId: string,
    newStatus: ReimbursementStatus
  ): Promise<Expense> {
    const expense = await ExpenseRepository.findById(id, userId);
    if (!expense) {
      throw new ExpenseValidationError("Expense not found");
    }

    const allowedTransitions =
      VALID_STATUS_TRANSITIONS[expense.reimbursement_status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new InvalidStatusTransitionError(
        expense.reimbursement_status,
        newStatus
      );
    }

    // Enforce receipt requirement before moving to "ready" or "submitted"
    if (
      (newStatus === "ready" || newStatus === "submitted") &&
      expense.receipt_status === "required_missing"
    ) {
      throw new ExpenseValidationError(
        "A receipt is required. Upload a receipt or mark it as not required before submitting.",
        "receipt_status"
      );
    }

    return ExpenseRepository.update(id, userId, {
      reimbursement_status: newStatus,
    });
  }

  static async markReceiptNotRequired(
    id: string,
    userId: string
  ): Promise<Expense> {
    return ExpenseRepository.update(id, userId, {
      receipt_status: "not_required",
    });
  }

  static async softDelete(id: string, userId: string): Promise<void> {
    const expense = await ExpenseRepository.findById(id, userId);
    if (!expense) {
      throw new ExpenseValidationError("Expense not found");
    }

    await ExpenseRepository.softDelete(id, userId);
  }
}
