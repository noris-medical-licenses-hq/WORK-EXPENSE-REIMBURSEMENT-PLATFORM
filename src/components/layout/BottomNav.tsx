"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  List,
  Plus,
  Plane,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const primaryTabs = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/expenses", icon: List, label: "Expenses" },
];

const secondaryTabs = [
  { href: "/trips", icon: Plane, label: "Trips" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {primaryTabs.map((tab) => (
          <NavTab
            key={tab.href}
            href={tab.href}
            icon={tab.icon}
            label={tab.label}
            active={isActive(tab.href)}
          />
        ))}

        {/* FAB — New Expense */}
        <Link
          href="/expenses/new"
          className="flex items-center justify-center w-14 h-14 -mt-5 bg-blue-600 rounded-full shadow-lg shadow-blue-200 active:bg-blue-700 transition-colors"
          aria-label="Add new expense"
        >
          <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
        </Link>

        {secondaryTabs.map((tab) => (
          <NavTab
            key={tab.href}
            href={tab.href}
            icon={tab.icon}
            label={tab.label}
            active={isActive(tab.href)}
          />
        ))}

      </div>
    </nav>
  );
}

function NavTab({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-lg transition-colors",
        active ? "text-blue-600" : "text-slate-400"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

