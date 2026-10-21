"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (!active) return;

      if (sessionError || !data.session) {
        setError(
          "This reset link is invalid or has expired. Please request a new password reset email."
        );
        setReady(false);
      } else {
        setReady(true);
      }

      setChecking(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setReady(true);
        setError("");
        setChecking(false);
      }
    });

    void checkSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage("Your password has been changed successfully.");
      await supabase.auth.signOut();

      window.setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-10">
        <p className="text-center text-[var(--muted)]">
          Checking your reset link…
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-white"
        >
          ← Back to LOUDEFOOT
        </Link>

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-white">
            Reset Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Choose a new password for your LOUDEFOOT account.
          </p>

          {message && (
            <div
              role="status"
              className="mt-5 rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300"
            >
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-5 break-words rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {ready && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-white outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Enter the password again"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-white outline-none focus:border-[var(--primary)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full px-5 py-3 text-sm disabled:opacity-50"
              >
                {loading ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          )}

          {!ready && (
            <Link
              href="/forgot-password"
              className="mt-5 block text-center text-sm text-[var(--primary)] hover:underline"
            >
              Request a new reset link
            </Link>
          )}

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            <Link href="/login" className="hover:underline">
              Return to Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
