"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ProfileRepository, type Profile } from "@/lib/repositories/profile.repository";

const CURRENCIES = [
  "USD", "EUR", "GBP", "ILS", "CAD", "AUD", "CHF",
  "JPY", "CNY", "INR", "MXN", "BRL", "SEK", "NOK", "DKK",
];

interface Props {
  profile: Profile;
  onSaved: (updated: Profile) => void;
}

export function ProfileForm({ profile, onSaved }: Props) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [currency, setCurrency] = useState(profile.default_currency);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await ProfileRepository.update(profile.id, {
        full_name: fullName.trim() || null,
        default_currency: currency,
      });
      onSaved(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Full Name
        </label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Default Currency
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <p className="text-sm text-slate-400 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg">
          {profile.email}
        </p>
        <p className="text-xs text-slate-400 mt-1">Email is managed by your sign-in provider.</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving…
          </>
        ) : success ? (
          "Saved ✓"
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  );
}
