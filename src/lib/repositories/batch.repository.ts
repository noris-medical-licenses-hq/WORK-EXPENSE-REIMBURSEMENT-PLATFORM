import { createClient } from "@/lib/supabase/client";
import type { ReimbursementBatch, ReimbursementBatchInsert } from "@/lib/types/batch.types";

export class BatchRepository {
  private static get db() {
    return createClient();
  }

  static async findAll(userId: string): Promise<ReimbursementBatch[]> {
    const { data, error } = await this.db
      .from("reimbursement_batches")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as ReimbursementBatch[];
  }

  static async create(insert: ReimbursementBatchInsert): Promise<ReimbursementBatch> {
    const { data, error } = await this.db
      .from("reimbursement_batches")
      .insert(insert as Record<string, unknown>)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as ReimbursementBatch;
  }
}
