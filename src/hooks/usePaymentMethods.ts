"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PaymentMethod } from "@/lib/types/expense.types";

export function usePaymentMethods(userId: string | undefined) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    createClient()
      .from("payment_methods")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("is_default", { ascending: false })
      .then(({ data }) => {
        setPaymentMethods((data as unknown as PaymentMethod[]) ?? []);
        setLoading(false);
      });
  }, [userId]);

  return { paymentMethods, loading };
}
