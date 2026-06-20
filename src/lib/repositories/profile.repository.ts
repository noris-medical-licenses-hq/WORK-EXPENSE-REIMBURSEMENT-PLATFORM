import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Pick<
  Database["public"]["Tables"]["profiles"]["Update"],
  "full_name" | "default_currency" | "avatar_url"
>;

export class ProfileRepository {
  private static get db() {
    return createClient();
  }

  static async get(userId: string): Promise<Profile | null> {
    const { data, error } = await this.db
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return data as unknown as Profile;
  }

  static async update(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await this.db
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() } as Record<string, unknown>)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as Profile;
  }
}
