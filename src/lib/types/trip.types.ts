import type { Database } from "@/lib/supabase/types";

export type TripStatus = Database["public"]["Enums"]["trip_status"];

export type Trip = Database["public"]["Tables"]["trips"]["Row"];
export type TripInsert = Database["public"]["Tables"]["trips"]["Insert"];
export type TripUpdate = Database["public"]["Tables"]["trips"]["Update"];

export type TripFormValues = {
  name: string;
  destination: string | null;
  client: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TripStatus;
  notes: string | null;
};
