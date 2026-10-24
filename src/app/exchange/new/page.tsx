import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Post Exchange Offer" };

export default function NewExchangeOfferPage() {
  return (
    <div className="container-main section-padding">
      <div className="mx-auto max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
          Coming soon
        </p>
        <h1 className="mt-3 text-xl font-semibold text-white">
          Exchange offers are not open yet
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          We&apos;re getting account exchanges ready for eFootball, Free Fire
          and CODM. In the meantime, you can list an account for sale or
          browse what&apos;s available.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/sell" className="btn btn-primary px-5 py-2.5 text-sm">
            Sell an Account
          </Link>
          <Link
            href="/accounts"
            className="btn btn-secondary px-5 py-2.5 text-sm"
          >
            Browse Accounts
          </Link>
        </div>
        <Link
          href="/exchange"
          className="mt-5 inline-block text-sm text-[var(--muted)] hover:text-white"
        >
          ← Back to Exchange Hub
        </Link>
      </div>
    </div>
  );
}
