"use client";

import { useCallback, useEffect, useState } from "react";
import { TripRepository } from "@/lib/repositories/trip.repository";
import type { Trip } from "@/lib/types/trip.types";

export function useTrips(userId: string | undefined) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setTrips(await TripRepository.findAll(userId));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { trips, loading, refresh };
}
