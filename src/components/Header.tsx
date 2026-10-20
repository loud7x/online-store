"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/accounts", label: "Browse Accounts" },
  { href: "/sell", label: "Sell" },
  { href: "/exchange", label: "Exchange Hub" },
  { href: "/coins", label: "Coin Loading" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;

      if (error || !data.user) {
        setLoggedIn(false);
        setUserEmail("");
        return;
      }

      setLoggedIn(true);
      setUserEmail(data.user.email ?? "");
    });

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

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md">
      <div className="container-main">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-bold text-white">
              L
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              LOUDE<span className="text-[var(--primary)]">FOOT</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/messages" className="btn btn-ghost px-3 py-2 text-sm">
              Messages
            </Link>

            {loggedIn ? (
              <>
                <span
                  className="max-w-40 truncate px-2 text-sm text-[var(--muted)]"
                  title={userEmail}
                >
                  {userEmail || "My account"}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="btn btn-secondary px-4 py-2 text-sm disabled:opacity-50"
                >
                  {loggingOut ? "Logging out..." : "Log out"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="px-2 py-2 text-sm text-[var(--muted)] hover:text-white disabled:opacity-50"
                >
                  Switch account
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn px-4 py-2 text-sm">
                  Login
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

          {/* Mobile menu button */}
          <button
            type="button"
            className="p-2 text-[var(--muted)] hover:text-white md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

        {/* Mobile navigation */}
        {mobileOpen && (
          <div className="space-y-1 border-t border-[var(--border)] py-4 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-2.5 text-[var(--muted)] hover:bg-white/5 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/messages"
              className="block rounded-md px-3 py-2.5 text-[var(--muted)] hover:bg-white/5 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Messages
            </Link>

            <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border)] pt-3">
              {loggedIn ? (
                <>
                  <p className="break-all px-3 py-2 text-sm text-[var(--muted)]">
                    Signed in as {userEmail || "My account"}
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="btn btn-secondary w-full py-2.5 text-sm disabled:opacity-50"
                  >
                    {loggingOut ? "Logging out..." : "Log out"}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full py-2.5 text-sm text-[var(--muted)] hover:text-white disabled:opacity-50"
                  >
                    Switch account
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="btn btn-secondary w-full py-2.5 text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="btn btn-primary w-full py-2.5 text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
