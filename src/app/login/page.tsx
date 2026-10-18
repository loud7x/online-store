"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    // Check if Supabase is configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setMessage(
        "Auth is ready but Supabase is not configured yet. Add your keys to .env.local to enable real login."
      );
      setLoading(false);
      return;
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Unable to connect. Check your configuration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-main section-padding">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Log in to your LOUDEFOOT account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4"
        >
          {error && (
            <div className="rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/30 px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30 px-4 py-3 text-sm text-[var(--primary)]">
              {message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--muted)] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--muted)] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-[var(--primary)] hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 text-sm disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[var(--primary)] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
