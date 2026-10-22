
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Direct Deals | LOUDEFOOT",
  description:
    "Contact eFootball account sellers directly to arrange your deal.",
};

export default function CheckoutPage() {
  return (
    <div className="container-main section-padding">
      <div className="mx-auto max-w-xl rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center sm:p-10">
        <h1 className="text-2xl font-semibold text-white">
          Arrange Your Deal Directly
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          LOUDEFOOT does not process payments for account purchases.
          Contact the seller to discuss the price, payment method, and
          account transfer before completing your deal.
        </p>

        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          For your safety, verify the account and agree on clear terms
          before sending money. Direct deals are arranged between buyers
          and sellers.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/accounts"
            className="btn btn-primary px-5 py-3 text-sm"
          >
            Browse Accounts
          </Link>

          <Link
            href="/"
            className="btn btn-secondary px-5 py-3 text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
