import type { Database } from "@/lib/supabase/types";

export type ReimbursementStatus =
  Database["public"]["Enums"]["reimbursement_status"];
export type ReceiptStatus = Database["public"]["Enums"]["receipt_status"];
export type PaymentMethodType =
  Database["public"]["Enums"]["payment_method_type"];

export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
export type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

export type Receipt = Database["public"]["Tables"]["receipts"]["Row"];
export type ReceiptInsert = Database["public"]["Tables"]["receipts"]["Insert"];

export type ExpenseCategory =
  Database["public"]["Tables"]["expense_categories"]["Row"];
export type ExpenseCategoryInsert =
  Database["public"]["Tables"]["expense_categories"]["Insert"];

export type PaymentMethod =
  Database["public"]["Tables"]["payment_methods"]["Row"];
export type PaymentMethodInsert =
  Database["public"]["Tables"]["payment_methods"]["Insert"];

export type ExpenseSummary =
  Database["public"]["Views"]["expense_summary"]["Row"];

// Extended expense type with joined relations (for display)
export type ExpenseWithRelations = Expense & {
  category?: ExpenseCategory | null;
  payment_method?: PaymentMethod | null;
};

// Form types (for React Hook Form)
export type ExpenseFormValues = {
  title: string;
  amount: number;
  currency: string;
  expense_date: string;
  category_id: string | null;
  payment_method_id: string | null;
  vendor_name: string | null;
  vendor_country: string | null;
  trip_id: string | null;
  project_id: string | null;
  batch_id: string | null;
  receipt_status: ReceiptStatus;
  is_personal: boolean;
  notes: string | null;
  description: string | null;
};
