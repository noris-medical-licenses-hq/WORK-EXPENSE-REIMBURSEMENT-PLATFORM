import { createClient } from "@/lib/supabase/client";
import type { Trip, TripInsert } from "@/lib/types/trip.types";

export class TripRepository {
  private static get db() {
    return createClient();
  }

  static async findById(id: string, userId: string): Promise<Trip | null> {
    const { data, error } = await this.db
      .from("trips")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as unknown as Trip | null;
  }

  static async findAll(userId: string): Promise<Trip[]> {
    const { data, error } = await this.db
      .from("trips")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("start_date", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Trip[];
  }

  static async create(insert: TripInsert): Promise<Trip> {
    const { data, error } = await this.db
      .from("trips")
      .insert(insert as Record<string, unknown>)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as Trip;
  }

  static async softDelete(id: string, userId: string): Promise<void> {
    const { error } = await this.db
      .from("trips")
      .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }
}
