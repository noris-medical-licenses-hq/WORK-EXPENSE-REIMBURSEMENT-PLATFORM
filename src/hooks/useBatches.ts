"use client";

import { useCallback, useEffect, useState } from "react";
import { BatchRepository } from "@/lib/repositories/batch.repository";
import type { ReimbursementBatch } from "@/lib/types/batch.types";

export function useBatches(userId: string | undefined) {
  const [batches, setBatches] = useState<ReimbursementBatch[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setBatches(await BatchRepository.findAll(userId));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { batches, loading, refresh };
}
