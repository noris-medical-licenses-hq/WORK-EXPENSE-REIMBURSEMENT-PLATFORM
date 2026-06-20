import { createClient } from "@/lib/supabase/client";
import type { PaymentMethod, PaymentMethodInsert } from "@/lib/types/expense.types";

type PaymentMethodUpdate = {
  name?: string;
  last_four?: string | null;
  is_default?: boolean;
  is_active?: boolean;
};

export class PaymentMethodRepository {
  private static get db() {
    return createClient();
  }

  static async findAll(userId: string): Promise<PaymentMethod[]> {
    const { data, error } = await this.db
      .from("payment_methods")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("is_default", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as PaymentMethod[];
  }

  static async create(insert: PaymentMethodInsert): Promise<PaymentMethod> {
    const { data, error } = await this.db
      .from("payment_methods")
      .insert(insert as Record<string, unknown>)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as PaymentMethod;
  }

  static async update(
    id: string,
    userId: string,
    updates: PaymentMethodUpdate
  ): Promise<PaymentMethod> {
    const { data, error } = await this.db
      .from("payment_methods")
      .update(updates as Record<string, unknown>)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as PaymentMethod;
  }

  static async remove(id: string, userId: string): Promise<void> {
    // Soft-remove: mark inactive rather than delete (expenses may reference it)
    const { error } = await this.db
      .from("payment_methods")
      .update({ is_active: false } as Record<string, unknown>)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }
}
