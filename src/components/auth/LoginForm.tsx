"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"google" | "microsoft" | "magic" | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRedirectTo = () => `${window.location.origin}/auth/callback`;

  async function handleGoogle() {
    setLoading("google");
    setError(null);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getRedirectTo() },
    });
    if (error) setError(error.message);
    setLoading(null);
  }

  async function handleMicrosoft() {
    setLoading("microsoft");
    setError(null);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "azure",
      options: { redirectTo: getRedirectTo() },
    });
    if (error) setError(error.message);
    setLoading(null);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading("magic");
    setError(null);
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getRedirectTo() },
    });
    if (error) {
      setError(error.message);
    } else {
      setMagicSent(true);
    }
    setLoading(null);
  }

  if (magicSent) {
    return (
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <p className="font-medium text-slate-900">Check your email</p>
        <p className="text-sm text-slate-500">
          We sent a sign-in link to <strong>{email}</strong>
        </p>
        <button
          onClick={() => setMagicSent(false)}
          className="text-sm text-blue-600 hover:underline"
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <button
        onClick={handleGoogle}
        disabled={!!loading}
        className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        {loading === "google" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      <button
        onClick={handleMicrosoft}
        disabled={!!loading}
        className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        {loading === "microsoft" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MicrosoftIcon />
        )}
        Continue with Microsoft
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-slate-50 text-xs text-slate-400">or</span>
        </div>
      </div>

      <form onSubmit={handleMagicLink} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!!loading || !email}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading === "magic" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          Send Magic Link
        </button>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#00A4EF" d="M13 1h10v10H13z" />
      <path fill="#7FBA00" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}
