
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coin Loading Removed | LOUDEFOOT",
  description: "Browse and trade eFootball accounts on LOUDEFOOT.",
};

export default function CoinsPage() {
  return (
    <div className="container-main section-padding">
      <div className="mx-auto max-w-xl rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center sm:p-10">
        <h1 className="text-2xl font-semibold text-white">
          Coin Loading Is Unavailable
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          LOUDEFOOT is focused on buying, selling, and exchanging eFootball
          accounts. Browse available accounts or visit the Exchange Hub to
          find your next deal.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/accounts"
            className="btn btn-primary px-5 py-3 text-sm"
          >
            Browse Accounts
          </Link>

          <Link
            href="/exchange"
            className="btn btn-secondary px-5 py-3 text-sm"
          >
            Visit Exchange Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
