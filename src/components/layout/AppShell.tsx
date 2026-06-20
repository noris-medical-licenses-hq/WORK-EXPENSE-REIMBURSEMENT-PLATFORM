"use client";

import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
        <main className="flex-1 min-h-screen ml-64 p-6">{children}</main>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        <main className="flex-1 pb-20">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
