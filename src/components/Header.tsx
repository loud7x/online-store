"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
const navLinks = [
  { href: "/accounts", label: "Browse Accounts" },
  { href: "/sell", label: "Sell" },
  { href: "/exchange", label: "Exchange Hub" },
  { href: "/coins", label: "Coin Loading" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabse.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoggedIn(!!session);
      }
     ); 
  return () => listener.subscription.unsubscribe();
}, []);  
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md">
      <div className="container-main">
        <div className="flex h-16 items-center justify-between gap-4">
    </div>
  </header>
);     
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white font-bold text-sm">
              LF
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              LOUDE<span className="text-[var(--primary)]">FOOT</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-[var(--muted)] hover:text-white transition-colors rounded-md hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/messages"
              className="btn btn-ghost px-3 py-2 text-sm"
            >
              Messages
            </Link>

        {!loggedIn && (
             <>
             <Link href="/login" className="btn px-4 py-2 text-sm"> 
              Login
            </Link>
            
            <Link
            href="/register" 
            className="btn btn-primary px-4 py-2 text-sm">
              Sign up
            </Link>
          </>
        )}
        </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-[var(--muted)] hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--border)] py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-[var(--muted)] hover:text-white hover:bg-white/5 rounded-md"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-[var(--border)] flex flex-col gap-2">
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
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
