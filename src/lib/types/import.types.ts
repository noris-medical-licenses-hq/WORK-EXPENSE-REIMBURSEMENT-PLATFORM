import type { Database } from "@/lib/supabase/types";

export type ImportStatus = Database["public"]["Enums"]["import_status"];
export type ImportTransactionStatus =
  Database["public"]["Enums"]["import_transaction_status"];

export type ImportSession =
  Database["public"]["Tables"]["import_sessions"]["Row"];
export type ImportTransaction =
  Database["public"]["Tables"]["import_transactions"]["Row"];

export type ParsedTransaction = {
  raw_date: string;
  raw_amount: string;
  raw_currency: string;
  raw_merchant: string;
  raw_description: string;
};

export type DuplicateCandidate = {
  expense_id: string;
  expense_title: string;
  expense_date: string;
  expense_amount: number;
  score: number;
  confidence: "high" | "medium" | "low";
};
