import { createClient } from "@/lib/supabase/client";
import type { Receipt, ReceiptInsert } from "@/lib/types/expense.types";

const BUCKET = "receipts";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const SIGNED_URL_EXPIRES_IN = 60 * 60; // 1 hour

export class ReceiptRepository {
  private static get db() {
    return createClient();
  }

  static buildStoragePath(userId: string, expenseId: string, fileName: string): string {
    const ext = fileName.split(".").pop() ?? "bin";
    const uuid = crypto.randomUUID();
    return `${userId}/${expenseId}/${uuid}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  }

  static async upload(
    userId: string,
    expenseId: string,
    file: File
  ): Promise<Receipt> {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`);
    }

    const path = this.buildStoragePath(userId, expenseId, file.name);

    const { error: uploadError } = await this.db.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data, error: insertError } = await this.db
      .from("receipts")
      .insert({
        expense_id: expenseId,
        user_id: userId,
        file_path: path,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
      } as Record<string, unknown>)
      .select()
      .single();

    if (insertError) {
      // Clean up orphaned storage file if DB insert fails
      await this.db.storage.from(BUCKET).remove([path]);
      throw new Error(insertError.message);
    }

    return data as unknown as Receipt;
  }

  static async findByExpense(expenseId: string): Promise<Receipt[]> {
    const { data, error } = await this.db
      .from("receipts")
      .select("*")
      .eq("expense_id", expenseId)
      .order("uploaded_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Receipt[];
  }

  static async getSignedUrl(filePath: string): Promise<string> {
    const { data, error } = await this.db.storage
      .from(BUCKET)
      .createSignedUrl(filePath, SIGNED_URL_EXPIRES_IN);

    if (error) throw new Error(error.message);
    return data.signedUrl;
  }

  static async remove(receiptId: string, filePath: string): Promise<void> {
    // Delete DB record first — if this fails nothing is lost (user can retry)
    const { error: dbError } = await this.db
      .from("receipts")
      .delete()
      .eq("id", receiptId);

    if (dbError) throw new Error(dbError.message);

    // Delete from Storage after — if this fails, file is orphaned but the DB
    // record is gone so the user is unblocked. Orphaned files can be cleaned
    // up by an admin; a dangling DB record cannot be recovered by the user.
    const { error: storageError } = await this.db.storage
      .from(BUCKET)
      .remove([filePath]);

    if (storageError) {
      console.error(`Storage cleanup failed for ${filePath}:`, storageError.message);
    }
  }
}
