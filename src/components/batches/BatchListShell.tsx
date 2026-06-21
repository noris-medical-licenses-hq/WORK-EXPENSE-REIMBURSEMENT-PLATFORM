"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { EmptyState } from "@/components/shared/EmptyState";
import { BatchRepository } from "@/lib/repositories/batch.repository";
import type { ReimbursementBatch } from "@/lib/types/batch.types";
import { formatDate } from "@/lib/utils/formatDate";

const STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  paid: "bg-emerald-50 text-emerald-800",
  rejected: "bg-red-50 text-red-600",
} as const;

export function BatchListShell() {
  const { user } = useUser();
  const [batches, setBatches] = useState<ReimbursementBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    BatchRepository.findAll(user.id)
      .then(setBatches)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const batch = await BatchRepository.create({
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        notes: null,
        status: "draft",
      });
      setBatches((prev) => [batch, ...prev]);
      setName(""); setDescription("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create batch");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 px-4 py-6 md:px-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Submission Batches</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Batch
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-800">New Submission Batch</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Batch name (e.g. June 2026 Expenses)"
            required
            autoFocus
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 border border-slate-200 text-slate-600 rounded-lg px-3 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Create"}
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && batches.length === 0 && !showForm && (
        <EmptyState
          title="No batches yet"
          description="Group expenses into a batch to track your reimbursement requests."
          ctaLabel="Create First Batch"
          icon={<Package className="w-8 h-8 text-slate-400" />}
          onCtaClick={() => setShowForm(true)}
        />
      )}

      {!loading && batches.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
          {batches.map((batch) => (
            <Link
              key={batch.id}
              href={`/batches/${batch.id}`}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{batch.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Created {formatDate(batch.created_at)}
                  {batch.description ? ` · ${batch.description}` : ""}
                </p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[batch.status]}`}>
                {batch.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
