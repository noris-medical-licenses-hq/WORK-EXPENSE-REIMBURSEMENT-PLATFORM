import { createClient } from "@/lib/supabase/client";
import type { ExpenseCategory, ExpenseCategoryInsert } from "@/lib/types/expense.types";

type CategoryUpdate = {
  name?: string;
  icon?: string | null;
  color?: string | null;
  is_active?: boolean;
  sort_order?: number;
};

export class CategoryRepository {
  private static get db() {
    return createClient();
  }

  static async findAll(userId: string): Promise<ExpenseCategory[]> {
    const { data, error } = await this.db
      .from("expense_categories")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as ExpenseCategory[];
  }

  static async create(insert: ExpenseCategoryInsert): Promise<ExpenseCategory> {
    const { data, error } = await this.db
      .from("expense_categories")
      .insert(insert as Record<string, unknown>)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as ExpenseCategory;
  }

  static async update(
    id: string,
    userId: string,
    updates: CategoryUpdate
  ): Promise<ExpenseCategory> {
    const { data, error } = await this.db
      .from("expense_categories")
      .update(updates as Record<string, unknown>)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as ExpenseCategory;
  }
}
