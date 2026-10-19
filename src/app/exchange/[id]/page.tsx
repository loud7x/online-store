export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exchangeOffers, formatNaira } from "@/data/mock";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const offer = exchangeOffers.find((o) => o.id === id);
  if (!offer) return { title: "Exchange Not Found" };
  return { title: offer.title };
}

export default async function ExchangeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = exchangeOffers.find((o) => o.id === id);
  if (!offer) notFound();

  return (
    <div className="container-main section-padding">
      <nav className="mb-6 text-sm text-[var(--muted)]">
        <Link href="/exchange" className="hover:text-white">Exchange Hub</Link>
        <span className="mx-2">/</span>
        <span className="text-white line-clamp-1">{offer.title}</span>
      </nav>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Offer details */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="badge bg-[var(--accent)] text-white">{offer.exchangeType}</span>
              <span className="badge bg-black/40 text-white border border-[var(--border)]">{offer.platform}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white leading-snug">
              {offer.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Posted {new Date(offer.listedAt).toLocaleDateString("en-NG", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </p>
          </div>

          {/* Their account summary */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Their Account</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{offer.teamStrength}</div>
                <div className="text-xs text-[var(--muted)]">Team Strength</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{offer.overallRating}</div>
                <div className="text-xs text-[var(--muted)]">Overall Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--primary)]">{formatNaira(offer.estimatedValue)}</div>
                <div className="text-xs text-[var(--muted)]">Est. Value</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold text-white mb-3">What they want</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{offer.preferred}</p>
            {offer.additionalCash != null && offer.additionalCash > 0 && (
              <p className="mt-3 text-sm text-[var(--primary)]">
                Willing to add {formatNaira(offer.additionalCash)} cash
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Description</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{offer.description}</p>
          </div>

          {/* Comparison placeholder */}
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-6 text-center">
            <h2 className="text-sm font-semibold text-white mb-2">Side-by-side comparison</h2>
            <p className="text-sm text-[var(--muted)] mb-4">
              After you propose your account, both accounts will appear here for comparison.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-[var(--muted-foreground)] mb-2">Their account</p>
                <p className="font-medium text-white">{offer.platform} · TS {offer.teamStrength}</p>
                <p className="text-sm text-[var(--muted)]">{formatNaira(offer.estimatedValue)}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 flex items-center justify-center">
                <p className="text-sm text-[var(--muted-foreground)]">Your account (after proposal)</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 px-4 py-3 text-sm text-[var(--warning)]">
            Both parties must explicitly confirm the exchange terms. No automatic transfers of accounts or funds.
          </div>
        </div>

        {/* Sidebar actions */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sticky top-24 space-y-3">
            <button type="button" className="btn btn-primary w-full py-3 text-sm">
              Propose Exchange
            </button>
            <button type="button" className="btn btn-secondary w-full py-3 text-sm">
              Message Seller
            </button>
            <p className="text-xs text-[var(--muted-foreground)] text-center">
              You can propose equal swap, upgrade, or add cash.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Offered by</h2>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-medium text-white">
                {offer.seller.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-white">{offer.seller.username}</span>
                  {offer.seller.verified && (
                    <svg className="h-4 w-4 text-[var(--primary)]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-[var(--muted)]">★ {offer.seller.rating}</p>
              </div>
            </div>
          </div>

          {/* Propose form (UI ready) */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Quick proposal</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--muted)] mb-1">Your account summary</label>
                <textarea
                  rows={3}
                  placeholder="Platform, team strength, key cards..."
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--muted)] mb-1">Additional cash (₦, optional)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--muted)] mb-1">Message</label>
                <textarea
                  rows={2}
                  placeholder="Why this is a good swap..."
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none resize-none"
                />
              </div>
              <button type="button" className="btn btn-primary w-full py-2.5 text-sm">
                Send Proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
