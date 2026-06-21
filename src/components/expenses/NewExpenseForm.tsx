"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useProfile } from "@/hooks/useProfile";
import { ExpenseService } from "@/lib/services/expense.service";
import type { ReceiptStatus } from "@/lib/types/expense.types";

const CURRENCIES = [
  "USD", "EUR", "GBP", "ILS", "CAD", "AUD", "CHF",
  "JPY", "CNY", "INR", "MXN", "BRL", "SEK", "NOK", "DKK",
];

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Amount must be greater than 0",
    }),
  currency: z.string().min(3).max(3),
  expense_date: z.string().min(1, "Date is required"),
  vendor_name: z.string().nullable(),
  category_id: z.string().nullable(),
  payment_method_id: z.string().nullable(),
  receipt_status: z.enum(["not_required", "required_missing", "uploaded"]),
  is_personal: z.boolean(),
  notes: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  userId: string;
}

export function NewExpenseForm({ userId }: Props) {
  const router = useRouter();
  const { categories } = useCategories(userId);
  const { paymentMethods } = usePaymentMethods(userId);
  const { profile } = useProfile(userId);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "USD",
      expense_date: new Date().toISOString().split("T")[0] ?? "",
      receipt_status: "required_missing",
      is_personal: false,
      category_id: null,
      payment_method_id: null,
      vendor_name: null,
      notes: null,
    },
  });

  // Override USD default with user's profile currency once loaded
  useEffect(() => {
    if (profile?.default_currency) {
      setValue("currency", profile.default_currency);
    }
  }, [profile?.default_currency, setValue]);

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      const expense = await ExpenseService.create(userId, {
        title: values.title,
        amount: parseFloat(values.amount),
        currency: values.currency,
        expense_date: values.expense_date,
        vendor_name: values.vendor_name ?? null,
        category_id: values.category_id ?? null,
        payment_method_id: values.payment_method_id ?? null,
        receipt_status: values.receipt_status as ReceiptStatus,
        is_personal: values.is_personal,
        notes: values.notes ?? null,
        description: null,
        trip_id: null,
        project_id: null,
        batch_id: null,
        vendor_country: null,
      });
      router.push(`/expenses/${expense.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save expense"
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {submitError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {submitError}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register("title")}
          placeholder="e.g. Client lunch, Flight to NYC"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Amount + Currency */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            {...register("amount")}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Currency
          </label>
          <select
            {...register("currency")}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          {...register("expense_date")}
          type="date"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.expense_date && (
          <p className="mt-1 text-xs text-red-500">
            {errors.expense_date.message}
          </p>
        )}
      </div>

      {/* Vendor */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Vendor / Merchant
        </label>
        <input
          {...register("vendor_name")}
          placeholder="e.g. Marriott, Delta, Uber"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Category
          </label>
          <select
            {...register("category_id")}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ""}{c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Payment Method */}
      {paymentMethods.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Payment Method
          </label>
          <select
            {...register("payment_method_id")}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Not specified</option>
            {paymentMethods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.last_four ? ` ···${p.last_four}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Receipt Status */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Receipt
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="relative flex items-center gap-2.5 border border-slate-200 rounded-lg px-3 py-2.5 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-colors">
            <input
              {...register("receipt_status")}
              type="radio"
              value="required_missing"
              className="sr-only"
            />
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center flex-shrink-0 [input:checked+&]:border-blue-500 [input:checked+&]:bg-blue-500">
              <div className="w-1.5 h-1.5 rounded-full bg-white hidden [input:checked~&]:block" />
            </div>
            <span className="text-sm text-slate-700">Will attach</span>
          </label>
          <label className="relative flex items-center gap-2.5 border border-slate-200 rounded-lg px-3 py-2.5 cursor-pointer has-[:checked]:border-slate-400 has-[:checked]:bg-slate-50 transition-colors">
            <input
              {...register("receipt_status")}
              type="radio"
              value="not_required"
              className="sr-only"
            />
            <span className="text-sm text-slate-700">Not required</span>
          </label>
        </div>
      </div>

      {/* Personal toggle */}
      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-sm font-medium text-slate-700">Personal expense</p>
          <p className="text-xs text-slate-400 mt-0.5">Not for reimbursement</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            {...register("is_personal")}
            type="checkbox"
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
        </label>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Notes
        </label>
        <textarea
          {...register("notes")}
          rows={3}
          placeholder="Business purpose, attendees, context..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-3.5 text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save Expense"
        )}
      </button>
    </form>
  );
}
