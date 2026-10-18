"use client";

import Link from "next/link";
import { useState } from "react";

const PLATFORMS = ["PlayStation", "Xbox", "PC", "Android", "iOS"];
const EXCHANGE_TYPES = [
  { value: "Equal", label: "Equal value" },
  { value: "upgrade", label: "Looking to upgrade" },
  { value: "downgrade", label: "Willing to downgrade" },
];

export default function NewExchangeOfferPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="container-main section-padding">
        <div className="max-w-lg mx-auto text-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
          <div className="text-3xl mb-3">✓</div>
          <h1 className="text-xl font-semibold text-white">Offer submitted</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Your exchange offer will appear in the Exchange Hub after review (demo mode — not saved to database yet).
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/exchange" className="btn btn-primary px-5 py-2.5 text-sm">
              Back to Exchange Hub
            </Link>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="btn btn-secondary px-5 py-2.5 text-sm"
            >
              Post another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main section-padding">
      <div className="max-w-xl mx-auto">
        <nav className="mb-6 text-sm text-[var(--muted)]">
          <Link href="/exchange" className="hover:text-white">Exchange Hub</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Post Offer</span>
        </nav>

        <h1 className="text-2xl font-semibold text-white mb-2">Post Exchange Offer</h1>
        <p className="text-sm text-[var(--muted)] mb-8">
          Describe the account you&apos;re offering and what you&apos;re looking for. Both parties must confirm before any exchange is completed.
        </p>

        <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">Title</label>
            <input
              required
              type="text"
              placeholder="e.g. Looking to upgrade 2400 → 2600+"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">Platform</label>
              <select
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="">Select</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">Exchange type</label>
              <select
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white focus:border-[var(--primary)] focus:outline-none"
              >
                {EXCHANGE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">Team strength</label>
              <input
                required
                type="number"
                min={0}
                placeholder="e.g. 2450"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">Estimated value (₦)</label>
              <input
                required
                type="number"
                min={0}
                placeholder="e.g. 90000"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">What you&apos;re looking for</label>
            <input
              required
              type="text"
              placeholder="e.g. 2600+ with at least 2 Epic cards"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">Additional cash (₦, optional)</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">Description</label>
            <textarea
              required
              rows={4}
              placeholder="Describe your account and the kind of exchange you want..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none resize-none"
            />
          </div>

          <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 px-4 py-3 text-xs text-[var(--warning)]">
            Do not include passwords, recovery codes, or payment details. Screenshots can be added after posting (when image upload is enabled).
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-[var(--border)]" />
            <span className="text-xs text-[var(--muted)] leading-relaxed">
              I understand that both parties must confirm terms, and that account transfers may be restricted by the game publisher.
            </span>
          </label>

          <button type="submit" className="btn btn-primary w-full py-2.5 text-sm">
            Submit Exchange Offer
          </button>
        </form>
      </div>
    </div>
  );
}
