export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { coinPackages, formatNaira, formatNumber } from "@/data/mock";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pkg = coinPackages.find((p) => p.id === id);
  if (!pkg) return { title: "Package Not Found" };
  return {
    title: `${pkg.name} — ${formatNumber(pkg.coins)} coins`,
    description: `Order ${formatNumber(pkg.coins)} eFootball coins for ${formatNaira(pkg.price)}.`,
  };
}

export default async function CoinPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = coinPackages.find((p) => p.id === id);
  if (!pkg) notFound();

  return (
    <div className="container-main section-padding">
      <nav className="mb-6 text-sm text-[var(--muted)]">
        <Link href="/coins" className="hover:text-white">
          Coin Loading
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white">{pkg.name}</span>
      </nav>

      <div className="grid lg:grid-cols-5 gap-8 max-w-4xl">
        <div className="lg:col-span-3 space-y-6">
          <div>
            {pkg.popular && (
              <span className="badge bg-[var(--primary)] text-white mb-3">Popular</span>
            )}
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">{pkg.name}</h1>
            <p className="mt-2 text-[var(--muted)]">
              {formatNumber(pkg.coins)} eFootball coins
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-center">
              <div className="text-2xl font-bold text-white">{formatNumber(pkg.coins)}</div>
              <div className="text-xs text-[var(--muted)] mt-1">Coins</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-center">
              <div className="text-2xl font-bold text-[var(--primary)]">
                {formatNaira(pkg.price)}
              </div>
              <div className="text-xs text-[var(--muted)] mt-1">Price</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-center">
              <div className="text-lg font-semibold text-white">{pkg.processingTime}</div>
              <div className="text-xs text-[var(--muted)] mt-1">Processing time</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-center">
              <div className="text-lg font-semibold text-[var(--success)]">
                {pkg.available ? "Available" : "Unavailable"}
              </div>
              <div className="text-xs text-[var(--muted)] mt-1">Status</div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold text-white mb-3">What you get</h2>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>• {formatNumber(pkg.coins)} coins loaded to your eFootball account</li>
              <li>• Order reference for tracking</li>
              <li>• Status updates: Pending → Confirmed → Processing → Completed</li>
              <li>• Estimated processing: {pkg.processingTime}</li>
            </ul>
          </div>

          <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 px-4 py-3 text-sm text-[var(--warning)]">
            We never ask for your Konami password or one-time authentication codes during
            normal ordering. Platform restrictions may apply.
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sticky top-24">
            <p className="text-3xl font-bold text-white">{formatNaira(pkg.price)}</p>
            <p className="text-sm text-[var(--muted)] mt-1">
              {formatNumber(pkg.coins)} coins · {pkg.processingTime}
            </p>
            {pkg.available ? (
              <Link
                href={`/checkout?package=${pkg.id}`}
                className="btn btn-primary w-full mt-5 py-3 text-sm"
              >
                Order Now
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="btn btn-secondary w-full mt-5 py-3 text-sm opacity-50 cursor-not-allowed"
              >
                Unavailable
              </button>
            )}
            <p className="mt-4 text-xs text-[var(--muted-foreground)] text-center">
              Secure checkout · ₦ NGN · Unique order reference
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
