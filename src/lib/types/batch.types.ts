import type { Database } from "@/lib/supabase/types";

export type BatchStatus = Database["public"]["Enums"]["batch_status"];

export type ReimbursementBatch =
  Database["public"]["Tables"]["reimbursement_batches"]["Row"];
export type ReimbursementBatchInsert =
  Database["public"]["Tables"]["reimbursement_batches"]["Insert"];
export type ReimbursementBatchUpdate =
  Database["public"]["Tables"]["reimbursement_batches"]["Update"];

export type BatchFormValues = {
  name: string;
  description: string | null;
  notes: string | null;
};

// Batch with computed totals (from query)
export type BatchWithTotals = ReimbursementBatch & {
  expense_count: number;
  totals: Array<{ currency: string; amount: number }>;
};
