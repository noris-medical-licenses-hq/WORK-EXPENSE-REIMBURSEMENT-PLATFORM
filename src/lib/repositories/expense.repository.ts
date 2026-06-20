import { createClient } from "@/lib/supabase/client";
import type {
  Expense,
  ExpenseInsert,
  ExpenseUpdate,
  ExpenseWithRelations,
} from "@/lib/types/expense.types";

export class ExpenseRepository {
  private static get db() {
    return createClient();
  }

  static async findAll(userId: string): Promise<ExpenseWithRelations[]> {
    const { data, error } = await this.db
      .from("expenses")
      .select(
        `*, category:expense_categories(*), payment_method:payment_methods(*)`
      )
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as ExpenseWithRelations[];
  }

  static async findById(
    id: string,
    userId: string
  ): Promise<ExpenseWithRelations | null> {
    const { data, error } = await this.db
      .from("expenses")
      .select(
        `*, category:expense_categories(*), payment_method:payment_methods(*)`
      )
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return data as unknown as ExpenseWithRelations;
  }

  static async findByStatus(
    userId: string,
    status: Expense["reimbursement_status"]
  ): Promise<Expense[]> {
    const { data, error } = await this.db
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .eq("reimbursement_status", status)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Expense[];
  }

  static async create(expense: ExpenseInsert): Promise<Expense> {
    const { data, error } = await this.db
      .from("expenses")
      .insert(expense as Parameters<typeof this.db.from>[0] extends never ? never : Record<string, unknown>)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as Expense;
  }

  static async update(
    id: string,
    userId: string,
    updates: ExpenseUpdate
  ): Promise<Expense> {
    const { data, error } = await this.db
      .from("expenses")
      .update({ ...updates, updated_at: new Date().toISOString() } as Record<string, unknown>)
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as Expense;
  }

  static async softDelete(id: string, userId: string): Promise<void> {
    const { error } = await this.db
      .from("expenses")
      .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }

  static async findMissingReceipts(userId: string): Promise<Expense[]> {
    const { data, error } = await this.db
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .eq("receipt_status", "required_missing")
      .is("deleted_at", null)
      .order("expense_date", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Expense[];
  }

  static async findByBatch(batchId: string, userId: string): Promise<Expense[]> {
    const { data, error } = await this.db
      .from("expenses")
      .select("*")
      .eq("batch_id", batchId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Expense[];
  }

  static async findByTrip(tripId: string, userId: string): Promise<Expense[]> {
    const { data, error } = await this.db
      .from("expenses")
      .select("*")
      .eq("trip_id", tripId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Expense[];
  }
}
