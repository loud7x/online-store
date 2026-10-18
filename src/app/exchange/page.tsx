import Link from "next/link";
import ExchangeCard from "@/components/ExchangeCard";
import { exchangeOffers } from "@/data/mock";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exchange Hub",
  description: "Trade eFootball accounts with other players. Post offers, propose swaps, and negotiate.",
};

export default function ExchangeHubPage() {
  return (
    <div className="container-main section-padding">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">Exchange Hub</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Trade accounts with other players. Both parties must confirm before any exchange is completed.
          </p>
        </div>
        <Link href="/exchange/new" className="btn btn-primary px-5 py-2.5 text-sm shrink-0">
          Post Exchange Offer
        </Link>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 mb-8">
        <h2 className="text-sm font-semibold text-white mb-3">How exchanges work</h2>
        <ol className="grid sm:grid-cols-4 gap-4 text-sm text-[var(--muted)]">
          <li><span className="text-[var(--primary)] font-medium">1.</span> Browse or post an offer</li>
          <li><span className="text-[var(--primary)] font-medium">2.</span> Propose your account (± cash)</li>
          <li><span className="text-[var(--primary)] font-medium">3.</span> Both parties confirm terms</li>
          <li><span className="text-[var(--primary)] font-medium">4.</span> Complete via messaging</li>
        </ol>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          No automatic account or fund transfers. Always use platform messaging and never share passwords publicly.
        </p>
      </div>

      {/* Filters bar (simple for Stage 3) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "Equal", "Upgrade", "Downgrade", "PlayStation", "Android", "PC", "Xbox", "iOS"].map((f) => (
          <button
            key={f}
            type="button"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              f === "All"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {exchangeOffers.map((offer) => (
          <ExchangeCard key={offer.id} offer={offer} />
        ))}
      </div>

      {/* Extra demo offers for richer hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 opacity-90">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium text-white">PC 2500 looking for equal swap</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">PC · TS 2510 · Est. ₦115,000</p>
            </div>
            <span className="badge bg-[var(--accent)] text-white">Equal</span>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">Prefer another PC or PlayStation account of similar strength.</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <div className="h-6 w-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[10px] font-medium text-white">PC</div>
            <span>PCTrader</span>
            <span>· ★ 4.4</span>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 opacity-90">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium text-white">Downgrade 2650 → 2300 + cash</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">PlayStation · TS 2650 · Est. ₦155,000</p>
            </div>
            <span className="badge bg-[var(--muted-foreground)] text-white">Downgrade</span>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">Want a lower-rated account and cash difference. Flexible on platform.</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <div className="h-6 w-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[10px] font-medium text-white">CA</div>
            <span>CashOutNG</span>
            <span className="text-[var(--primary)]">✓</span>
            <span>· ★ 4.8</span>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
        Demo exchange offers. Real data loads from Supabase once configured.
      </p>
    </div>
  );
}
