"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Plane } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { TripRepository } from "@/lib/repositories/trip.repository";
import { ExpenseRepository } from "@/lib/repositories/expense.repository";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate, formatDateFull } from "@/lib/utils/formatDate";
import {
  REIMBURSEMENT_STATUS_LABELS,
  REIMBURSEMENT_STATUS_COLORS,
  TRIP_STATUS_LABELS,
} from "@/lib/constants/status";
import type { Trip } from "@/lib/types/trip.types";
import type { Expense } from "@/lib/types/expense.types";

const TRIP_STATUS_COLORS = {
  planning: "bg-slate-100 text-slate-600",
  active: "bg-green-50 text-green-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-600",
} as const;

function sumByCurrency(list: Expense[]): string {
  const byC: Record<string, number> = {};
  for (const e of list) {
    byC[e.currency] = (byC[e.currency] ?? 0) + e.amount;
  }
  const entries = Object.entries(byC);
  if (entries.length === 0) return "";
  return entries.map(([c, a]) => formatCurrency(a, c)).join(" · ");
}

export function TripDetailShell({ id }: { id: string }) {
  const { user } = useUser();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [tripData, expenseData] = await Promise.all([
        TripRepository.findById(id, user.id),
        ExpenseRepository.findByTrip(id, user.id),
      ]);
      setTrip(tripData);
      setExpenses(expenseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trip");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-0 flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="px-4 py-6 md:px-0">
        <Link href="/trips" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to trips
        </Link>
        <p className="text-slate-500">{error ?? "Trip not found."}</p>
      </div>
    );
  }

  const total = sumByCurrency(expenses);

  return (
    <div className="px-4 py-6 md:px-0 max-w-lg space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/trips"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 flex-1 truncate">{trip.name}</h1>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${TRIP_STATUS_COLORS[trip.status]}`}>
          {TRIP_STATUS_LABELS[trip.status]}
        </span>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Trip details */}
      {(trip.destination || trip.start_date || trip.end_date || trip.client || trip.notes) && (
        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
          {trip.destination && (
            <div className="flex items-center gap-3 px-4 py-3">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-700">{trip.destination}</span>
            </div>
          )}
          {(trip.start_date || trip.end_date) && (
            <div className="flex items-center gap-3 px-4 py-3">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-700">
                {trip.start_date && formatDateFull(trip.start_date)}
                {trip.start_date && trip.end_date && " – "}
                {trip.end_date && formatDateFull(trip.end_date)}
              </span>
            </div>
          )}
          {trip.client && (
            <div className="flex items-start justify-between px-4 py-3">
              <span className="text-sm text-slate-400">Client</span>
              <span className="text-sm text-slate-700">{trip.client}</span>
            </div>
          )}
          {trip.notes && (
            <div className="flex items-start justify-between px-4 py-3 gap-4">
              <span className="text-sm text-slate-400 flex-shrink-0">Notes</span>
              <span className="text-sm text-slate-700 text-right">{trip.notes}</span>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {expenses.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">on this trip</p>
          </div>
          {total && <p className="text-base font-semibold text-slate-900">{total}</p>}
        </div>
      )}

      {/* Expense list */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">Expenses</p>
        {expenses.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 px-4 py-10 text-center">
            <Plane className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No expenses linked to this trip yet.</p>
            <p className="text-xs text-slate-300 mt-1">
              When you create an expense, you will be able to link it to a trip.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
            {expenses.map((expense) => {
              const colors = REIMBURSEMENT_STATUS_COLORS[expense.reimbursement_status];
              return (
                <Link
                  key={expense.id}
                  href={`/expenses/${expense.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{expense.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(expense.expense_date)}</p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(expense.amount, expense.currency)}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${colors?.bg ?? ""} ${colors?.text ?? ""}`}
                    >
                      {REIMBURSEMENT_STATUS_LABELS[expense.reimbursement_status]}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
