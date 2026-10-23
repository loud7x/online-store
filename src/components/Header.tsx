"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data.user) {
        setLoggedIn(false);
        setUserEmail("");
        return;
      }
      setLoggedIn(true);
      setUserEmail(data.user.email ?? "");
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setLoggedIn(!!session);
      setUserEmail(session?.user.email ?? "");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();
    setLoggingOut(false);
    if (error) {
      alert(`Could not log out: ${error.message}`);
      return;
    }
    setLoggedIn(false);
    setUserEmail("");
    setMobileOpen(false);
    router.push("/login");
    router.refresh();
  }

  function closeMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="container-main">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* LOUDEFOOT logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-lg font-extrabold text-white">
              L
            </span>
            <span className="text-xl font-extrabold tracking-tight text-white">
              LOUDE<span className="text-[var(--primary)]">FOOT</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-white/5 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/accounts"
              className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-white/5 hover:text-white"
            >
              Accounts
            </Link>
            <Link
              href="/sell"
              className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-white/5 hover:text-white"
            >
              Sell
            </Link>
            <Link
              href="/exchange"
              className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-white/5 hover:text-white"
            >
              Exchange
            </Link>
          </nav>

          {/* Desktop account actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/messages"
              className="btn btn-ghost px-3 py-2 text-sm"
            >
              Messages
            </Link>
            {loggedIn ? (
              <>
                <Link
                  href="/profile"
                  title={userEmail}
                  className="max-w-40 truncate px-2 py-2 text-sm text-[var(--muted)] hover:text-white"
                >
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="btn btn-secondary px-4 py-2 text-sm disabled:opacity-50"
                >
                  {loggingOut ? "Logging out..." : "Log out"}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn px-4 py-2 text-sm">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary px-4 py-2 text-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Compact mobile menu button */}
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] text-white transition hover:border-[var(--primary)] hover:bg-white/5 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close account menu" : "Open account menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-account-menu"
          >
            {mobileOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Simplified mobile account menu */}
        {mobileOpen && (
          <div
            id="mobile-account-menu"
            className="border-t border-[var(--border)] py-4 md:hidden"
          >
            {loggedIn ? (
              <>
                <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Signed in as
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-white">
                    {userEmail || "My account"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-white transition hover:border-[var(--primary)]"
                  >
                    My Profile
                    <span className="text-[var(--accent)]">→</span>
                  </Link>
                  <Link
                    href="/messages"
                    onClick={closeMenu}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-white transition hover:border-[var(--primary)]"
                  >
                    Messages
                    <span className="text-[var(--accent)]">→</span>
                  </Link>
                  <Link
                    href="/my-listings"
                    onClick={closeMenu}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-white transition hover:border-[var(--primary)]"
                  >
                    My Listings
                    <span className="text-[var(--accent)]">→</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="mt-3 w-full rounded-xl border border-red-500/40 px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {loggingOut ? "Logging out..." : "Log out"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-white">
                    Welcome to LOUDEFOOT
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Sign in to manage your account and listings.
                  </p>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="btn btn-secondary flex w-full items-center justify-center px-4 py-3 text-sm"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="btn btn-primary flex w-full items-center justify-center px-4 py-3 text-sm"
                  >
                    Sign up
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
