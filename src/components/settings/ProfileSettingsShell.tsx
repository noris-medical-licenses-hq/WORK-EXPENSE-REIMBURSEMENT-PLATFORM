import { Settings } from "lucide-react";

export function ProfileSettingsShell() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-0 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your profile and preferences
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
        <SettingsRow label="Profile" description="Name and default currency" href="/settings" />
        <SettingsRow label="Categories" description="Manage expense categories" href="/settings/categories" />
        <SettingsRow label="Payment Methods" description="Manage payment methods" href="/settings/payment-methods" />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <p className="text-sm text-slate-500 text-center py-4 flex items-center justify-center gap-2">
          <Settings className="w-4 h-4" />
          Profile settings coming in Sprint 2
        </p>
      </div>
    </div>
  );
}

function SettingsRow({
  label,
  description,
  href,
}: {
  label: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors"
    >
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <span className="text-slate-300">›</span>
    </a>
  );
}
