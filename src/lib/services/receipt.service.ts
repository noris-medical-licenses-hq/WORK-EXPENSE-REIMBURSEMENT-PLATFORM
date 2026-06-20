import { ReceiptRepository } from "@/lib/repositories/receipt.repository";
import { ExpenseRepository } from "@/lib/repositories/expense.repository";
import type { Receipt } from "@/lib/types/expense.types";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

export class ReceiptService {
  static async upload(
    userId: string,
    expenseId: string,
    file: File
  ): Promise<Receipt> {
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new Error(
        "File type not supported. Upload a JPEG, PNG, WebP, HEIC, or PDF."
      );
    }

    const receipt = await ReceiptRepository.upload(userId, expenseId, file);

    // Mark expense receipt_status as uploaded
    await ExpenseRepository.update(expenseId, userId, {
      receipt_status: "uploaded",
    });

    return receipt;
  }

  static async remove(
    userId: string,
    expenseId: string,
    receiptId: string,
    filePath: string,
    remainingCount: number
  ): Promise<void> {
    await ReceiptRepository.remove(receiptId, filePath);

    // If no receipts remain, revert to required_missing
    if (remainingCount <= 1) {
      await ExpenseRepository.update(expenseId, userId, {
        receipt_status: "required_missing",
      });
    }
  }

  static async getSignedUrl(filePath: string): Promise<string> {
    return ReceiptRepository.getSignedUrl(filePath);
  }

  static async findByExpense(expenseId: string): Promise<Receipt[]> {
    return ReceiptRepository.findByExpense(expenseId);
  }
}
