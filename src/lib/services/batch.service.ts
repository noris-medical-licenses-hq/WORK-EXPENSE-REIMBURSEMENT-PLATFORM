import { BatchRepository } from "@/lib/repositories/batch.repository";
import { ExpenseRepository } from "@/lib/repositories/expense.repository";
import type { ReimbursementBatch, BatchStatus } from "@/lib/types/batch.types";

export class BatchValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BatchValidationError";
  }
}

const VALID_BATCH_TRANSITIONS: Record<BatchStatus, BatchStatus[]> = {
  draft: ["submitted"],
  submitted: ["approved"],
  approved: ["paid"],
  paid: [],
  rejected: [],
};

// When a batch moves to newStatus, propagate to expenses that are in fromStatus
const EXPENSE_PROPAGATION: Partial<Record<BatchStatus, { from: string; to: string }>> = {
  submitted: { from: "ready", to: "submitted" },
  approved: { from: "submitted", to: "approved" },
  paid: { from: "approved", to: "paid" },
};

export class BatchService {
  static async assignExpenses(
    batchId: string,
    userId: string,
    expenseIds: string[]
  ): Promise<void> {
    if (expenseIds.length === 0) return;

    const batch = await BatchRepository.findById(batchId, userId);
    if (!batch) throw new BatchValidationError("Batch not found");
    if (batch.status !== "draft") {
      throw new BatchValidationError("Expenses can only be added to a draft batch");
    }

    await ExpenseRepository.assignToBatch(expenseIds, batchId, userId);
  }

  static async removeExpense(
    batchId: string,
    userId: string,
    expenseId: string
  ): Promise<void> {
    const batch = await BatchRepository.findById(batchId, userId);
    if (!batch) throw new BatchValidationError("Batch not found");
    if (batch.status !== "draft") {
      throw new BatchValidationError("Expenses can only be removed from a draft batch");
    }

    await ExpenseRepository.removeFromBatch(expenseId, userId);
  }

  static async changeStatus(
    batchId: string,
    userId: string,
    newStatus: BatchStatus
  ): Promise<ReimbursementBatch> {
    const batch = await BatchRepository.findById(batchId, userId);
    if (!batch) throw new BatchValidationError("Batch not found");

    const allowed = VALID_BATCH_TRANSITIONS[batch.status];
    if (!allowed.includes(newStatus)) {
      throw new BatchValidationError(
        `Cannot transition from "${batch.status}" to "${newStatus}"`
      );
    }

    if (newStatus === "submitted") {
      const expenses = await ExpenseRepository.findByBatch(batchId, userId);
      if (expenses.length === 0) {
        throw new BatchValidationError(
          "Cannot submit an empty batch. Add at least one expense first."
        );
      }
      const readyCount = expenses.filter((e) => e.reimbursement_status === "ready").length;
      if (readyCount === 0) {
        throw new BatchValidationError(
          "No ready expenses to submit. Mark expenses as Ready before submitting the batch."
        );
      }
    }

    // Update batch status first
    const updated = await BatchRepository.updateStatus(batchId, userId, newStatus);

    // Propagate status to expenses in this batch
    const propagation = EXPENSE_PROPAGATION[newStatus];
    if (propagation) {
      await ExpenseRepository.propagateBatchStatus(
        batchId,
        userId,
        propagation.from,
        propagation.to
      );
    }

    return updated;
  }
}
