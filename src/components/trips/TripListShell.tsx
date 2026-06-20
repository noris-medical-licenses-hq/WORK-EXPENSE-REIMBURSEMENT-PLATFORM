"use client";

import { useState } from "react";
import { Plane, Plus, MapPin, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { EmptyState } from "@/components/shared/EmptyState";
import { TripRepository } from "@/lib/repositories/trip.repository";
import { useEffect } from "react";
import type { Trip } from "@/lib/types/trip.types";
import { formatDate } from "@/lib/utils/formatDate";

const STATUS_COLORS = {
  planning: "bg-slate-100 text-slate-600",
  active: "bg-green-50 text-green-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-600",
} as const;

export function TripListShell() {
  const { user } = useUser();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    TripRepository.findAll(user.id)
      .then(setTrips)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const trip = await TripRepository.create({
        user_id: user.id,
        name: name.trim(),
        destination: destination.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        status: "planning",
        client: null,
        notes: null,
      });
      setTrips((prev) => [trip, ...prev]);
      setName(""); setDestination(""); setStartDate(""); setEndDate("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create trip");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 px-4 py-6 md:px-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Trips</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Trip
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-800">New Trip</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Trip name (e.g. NYC Client Visit)"
            required
            autoFocus
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination (optional)"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
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

      {!loading && trips.length === 0 && !showForm && (
        <EmptyState
          title="No trips yet"
          description="Create a trip to organize travel-related expenses together."
          ctaLabel="Create First Trip"
          ctaHref="#"
          icon={<Plane className="w-8 h-8 text-slate-400" />}
          onCtaClick={() => setShowForm(true)}
        />
      )}

      {!loading && trips.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
          {trips.map((trip) => (
            <div key={trip.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Plane className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{trip.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  {trip.destination && (
                    <>
                      <MapPin className="w-3 h-3" />
                      {trip.destination}
                      {(trip.start_date || trip.end_date) && " · "}
                    </>
                  )}
                  {trip.start_date && formatDate(trip.start_date)}
                  {trip.start_date && trip.end_date && " – "}
                  {trip.end_date && formatDate(trip.end_date)}
                </p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[trip.status]}`}>
                {trip.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
