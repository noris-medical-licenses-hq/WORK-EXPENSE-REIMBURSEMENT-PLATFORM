import { createClient } from "@/lib/supabase/client";
import type { ReimbursementBatch, ReimbursementBatchInsert, BatchStatus } from "@/lib/types/batch.types";

export class BatchRepository {
  private static get db() {
    return createClient();
  }

  static async findById(id: string, userId: string): Promise<ReimbursementBatch | null> {
    const { data, error } = await this.db
      .from("reimbursement_batches")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as unknown as ReimbursementBatch | null;
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

  static async updateStatus(
    id: string,
    userId: string,
    status: BatchStatus
  ): Promise<ReimbursementBatch> {
    const { data, error } = await this.db
      .from("reimbursement_batches")
      .update({ status, updated_at: new Date().toISOString() } as Record<string, unknown>)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as ReimbursementBatch;
  }
}
