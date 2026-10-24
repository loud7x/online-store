"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const turnstileRef = useRef<TurnstileInstance>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirectUrl,
          captchaToken,
        });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage(
        "If an account exists for this email, a password reset link will be sent. Check your inbox and spam folder."
      );
    } catch {
      setError(
        "Something went wrong. Please check your internet connection and try again."
      );
    } finally {
      // Captcha tokens are single-use, so get a fresh one
      turnstileRef.current?.reset();
      setCaptchaToken("");
      setLoading(false);
    }
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
            Forgot Password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Enter the email address linked to your LOUDEFOOT account.
            We will send you a link to reset your password.
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

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-white"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-white outline-none focus:border-[var(--primary)]"
              />
            </div>

            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={setCaptchaToken}
              onExpire={() => setCaptchaToken("")}
            />

            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="btn btn-primary w-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-[var(--primary)] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
