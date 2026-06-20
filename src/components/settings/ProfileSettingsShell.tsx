"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useProfile } from "@/hooks/useProfile";
import { useCategories } from "@/hooks/useCategories";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { ProfileForm } from "./ProfileForm";
import { CategoriesManager } from "./CategoriesManager";
import { PaymentMethodsManager } from "./PaymentMethodsManager";
import type { ExpenseCategory, PaymentMethod } from "@/lib/types/expense.types";

type Tab = "profile" | "categories" | "payment-methods";

export function ProfileSettingsShell() {
  const { user } = useUser();
  const { profile, loading: profileLoading, refresh: refreshProfile } = useProfile(user?.id);
  const { categories, loading: catsLoading } = useCategories(user?.id);
  const { paymentMethods, loading: pmsLoading } = usePaymentMethods(user?.id);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [localCategories, setLocalCategories] = useState<ExpenseCategory[] | null>(null);
  const [localPMs, setLocalPMs] = useState<PaymentMethod[] | null>(null);

  const displayCategories = localCategories ?? categories;
  const displayPMs = localPMs ?? paymentMethods;

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "categories", label: "Categories" },
    { id: "payment-methods", label: "Payment Methods" },
  ];

  return (
    <div className="space-y-4 px-4 py-6 md:px-0 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your profile and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-xs font-medium px-2 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {activeTab === "profile" && (
          <div className="p-4">
            {profileLoading || !user ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !profile ? (
              <p className="text-sm text-slate-400 text-center py-8">
                Profile not found. Try signing out and back in.
              </p>
            ) : (
              <ProfileForm
                profile={profile}
                onSaved={refreshProfile}
              />
            )}
          </div>
        )}

        {activeTab === "categories" && (
          <>
            {catsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <CategoriesManager
                categories={displayCategories}
                userId={user?.id ?? ""}
                onChanged={setLocalCategories}
              />
            )}
          </>
        )}

        {activeTab === "payment-methods" && (
          <>
            {pmsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <PaymentMethodsManager
                paymentMethods={displayPMs}
                userId={user?.id ?? ""}
                onChanged={setLocalPMs}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
