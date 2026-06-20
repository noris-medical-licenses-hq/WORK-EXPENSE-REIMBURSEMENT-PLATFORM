"use client";

import { useCallback, useEffect, useState } from "react";
import { ProfileRepository, type Profile } from "@/lib/repositories/profile.repository";

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setProfile(await ProfileRepository.get(userId));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, loading, refresh };
}
