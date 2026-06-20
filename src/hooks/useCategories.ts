"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ExpenseCategory } from "@/lib/types/expense.types";

export function useCategories(userId: string | undefined) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    createClient()
      .from("expense_categories")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setCategories((data as unknown as ExpenseCategory[]) ?? []);
        setLoading(false);
      });
  }, [userId]);

  return { categories, loading };
}
