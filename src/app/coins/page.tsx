import Link from "next/link";
import CoinPackageCard from "@/components/CoinPackageCard";
import { coinPackages } from "@/data/mock";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coin Loading",
  description: "Order eFootball coin loading packages. Tracked fulfilment in Nigerian Naira.",
};

export default function CoinsPage() {
  return (
    <div className="container-main section-padding">
      <div className="max-w-2xl mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">
          Coin Loading
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
          Choose a package, complete payment, and track your order. We do not request or store
          Konami account passwords or one-time codes as part of the normal process.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {coinPackages.map((pkg) => (
          <CoinPackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-white mb-4">How it works</h2>
        <ol className="grid sm:grid-cols-4 gap-4 text-sm text-[var(--muted)]">
          <li>
            <span className="text-[var(--primary)] font-medium">1.</span> Select a package
          </li>
          <li>
            <span className="text-[var(--primary)] font-medium">2.</span> Enter platform &amp; order details
          </li>
          <li>
            <span className="text-[var(--primary)] font-medium">3.</span> Pay securely (₦)
          </li>
          <li>
            <span className="text-[var(--primary)] font-medium">4.</span> Track status until completed
          </li>
        </ol>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Platform restrictions may apply. Fulfilment uses legitimate, authorised methods only.
          You will receive an order reference after checkout.
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link href="/orders" className="text-sm text-[var(--primary)] hover:underline">
          Track an existing order →
        </Link>
      </div>
    </div>
  );
}
