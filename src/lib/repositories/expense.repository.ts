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
        `*, category:expense_categories(*), payment_method:payment_methods(*), trip:trips(id,name), batch:reimbursement_batches(id,name)`
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
      .insert(expense as Record<string, unknown>)
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

  // Ready expenses with no batch assignment — used for batch assignment UI
  static async findReadyUnassigned(userId: string): Promise<Expense[]> {
    const { data, error } = await this.db
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .eq("reimbursement_status", "ready")
      .is("batch_id", null)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Expense[];
  }

  static async assignToBatch(
    expenseIds: string[],
    batchId: string,
    userId: string
  ): Promise<void> {
    if (expenseIds.length === 0) return;
    const { error } = await this.db
      .from("expenses")
      .update({ batch_id: batchId, updated_at: new Date().toISOString() } as Record<string, unknown>)
      .in("id", expenseIds)
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (error) throw new Error(error.message);
  }

  static async removeFromBatch(expenseId: string, userId: string): Promise<void> {
    const { error } = await this.db
      .from("expenses")
      .update({ batch_id: null, updated_at: new Date().toISOString() } as Record<string, unknown>)
      .eq("id", expenseId)
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (error) throw new Error(error.message);
  }

  // Bulk status update for all expenses in a batch with a specific source status
  static async propagateBatchStatus(
    batchId: string,
    userId: string,
    fromStatus: string,
    toStatus: string
  ): Promise<void> {
    const { error } = await this.db
      .from("expenses")
      .update({ reimbursement_status: toStatus, updated_at: new Date().toISOString() } as Record<string, unknown>)
      .eq("batch_id", batchId)
      .eq("user_id", userId)
      .eq("reimbursement_status", fromStatus)
      .is("deleted_at", null);

    if (error) throw new Error(error.message);
  }
}
