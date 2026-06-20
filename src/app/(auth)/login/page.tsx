import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Expense Tracker</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Sign in to manage your reimbursements
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
