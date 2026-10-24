import Link from "next/link";
import ExchangeCard from "@/components/ExchangeCard";
import { exchangeOffers } from "@/data/mock";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exchange Hub",
  description:
    "Trade game accounts with other players. Post offers, propose swaps, and negotiate on LoudVault.",
};

export default function ExchangeHubPage() {
  return (
    <div className="container-main section-padding">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            Exchange Hub
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Trade game accounts with other players. Both parties must confirm
            before any exchange is completed.
          </p>
        </div>
        <Link
          href="/exchange/new"
          className="btn btn-primary shrink-0 px-5 py-2.5 text-sm"
        >
          Post Exchange Offer
        </Link>
      </div>

      {/* How it works */}
      <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">
          How exchanges work
        </h2>
        <ol className="grid gap-4 text-sm text-[var(--muted)] sm:grid-cols-4">
          <li>
            <span className="font-medium text-[var(--primary)]">1.</span>{" "}
            Browse or post an offer
          </li>
          <li>
            <span className="font-medium text-[var(--primary)]">2.</span>{" "}
            Propose your account (± cash)
          </li>
          <li>
            <span className="font-medium text-[var(--primary)]">3.</span> Both
            parties confirm terms
          </li>
          <li>
            <span className="font-medium text-[var(--primary)]">4.</span>{" "}
            Complete via messaging
          </li>
        </ol>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          No automatic account or fund transfers. Always use platform messaging
          and never share passwords publicly.
        </p>
      </div>

      {exchangeOffers.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {exchangeOffers.map((offer) => (
            <ExchangeCard key={offer.id} offer={offer} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="font-semibold text-white">No exchange offers yet</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Be the first to post an offer, or browse accounts to buy instead.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/exchange/new"
              className="btn btn-primary px-5 py-2.5 text-sm"
            >
              Post Exchange Offer
            </Link>
            <Link
              href="/accounts"
              className="btn btn-secondary px-5 py-2.5 text-sm"
            >
              Browse Accounts
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
