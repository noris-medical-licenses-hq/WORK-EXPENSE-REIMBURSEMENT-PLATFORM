"use client";

import { useCallback, useEffect, useState } from "react";
import { ExpenseRepository } from "@/lib/repositories/expense.repository";
import type { ExpenseWithRelations } from "@/lib/types/expense.types";

export function useExpenses(userId: string | undefined) {
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ExpenseRepository.findAll(userId);
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { expenses, loading, error, refresh };
}
