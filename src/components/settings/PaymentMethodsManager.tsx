"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { PaymentMethodRepository } from "@/lib/repositories/payment_method.repository";
import type { PaymentMethod, PaymentMethodType } from "@/lib/types/expense.types";

const PM_TYPES: { value: PaymentMethodType; label: string }[] = [
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "apple_pay", label: "Apple Pay" },
  { value: "google_pay", label: "Google Pay" },
  { value: "other", label: "Other" },
];

interface Props {
  paymentMethods: PaymentMethod[];
  userId: string;
  onChanged: (updated: PaymentMethod[]) => void;
}

export function PaymentMethodsManager({ paymentMethods, userId, onChanged }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<PaymentMethodType>("credit_card");
  const [lastFour, setLastFour] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const pm = await PaymentMethodRepository.create({
        user_id: userId,
        name: name.trim(),
        type,
        last_four: lastFour.trim() || null,
        is_default: paymentMethods.length === 0,
        is_active: true,
      });
      onChanged([...paymentMethods, pm]);
      setName("");
      setType("credit_card");
      setLastFour("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(pm: PaymentMethod) {
    if (!confirm(`Remove ${pm.name}? It will no longer appear in expense forms.`)) return;
    setRemovingId(pm.id);
    try {
      await PaymentMethodRepository.remove(pm.id, userId);
      onChanged(paymentMethods.filter((p) => p.id !== pm.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      {paymentMethods.length === 0 && !showForm && (
        <p className="text-sm text-slate-400 text-center py-6">
          No payment methods yet.
        </p>
      )}

      {paymentMethods.length > 0 && (
        <ul className="divide-y divide-slate-100 mb-3">
          {paymentMethods.map((pm) => (
            <li key={pm.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {pm.name}
                  {pm.last_four ? ` ···${pm.last_four}` : ""}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {PM_TYPES.find((t) => t.value === pm.type)?.label ?? pm.type}
                  {pm.is_default ? " · Default" : ""}
                </p>
              </div>
              <button
                onClick={() => handleRemove(pm)}
                disabled={removingId === pm.id}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {removingId === pm.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mx-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          {error}
        </p>
      )}

      {showForm ? (
        <form onSubmit={handleAdd} className="px-4 py-3 space-y-3 border-t border-slate-100">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Amex Platinum)"
            autoFocus
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PaymentMethodType)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              value={lastFour}
              onChange={(e) => setLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Last 4 digits"
              maxLength={4}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null); }}
              className="flex-1 border border-slate-200 text-slate-600 rounded-lg px-3 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add"}
            </button>
          </div>
        </form>
      ) : (
        <div className="px-4 py-2 border-t border-slate-100">
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 py-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Payment Method
          </button>
        </div>
      )}
    </div>
  );
}
