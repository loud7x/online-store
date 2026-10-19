import Link from "next/link";
import { notFound } from "next/navigation";
import { featuredAccounts, recentAccounts, formatNaira, formatNumber } from "@/data/mock";
import type { Metadata } from "next";

const allListings = [...featuredAccounts, ...recentAccounts];

expert function generateStaticParam() {
  return allListing.map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const account = allListings.find((a) => a.id === id);
  if (!account) return { title: "Account Not Found" };
  return {
    title: account.title,
    description: `${account.platform} · TS ${account.teamStrength} · ${formatNaira(account.price)}`,
  };
}

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = allListings.find((a) => a.id === id);

  if (!account) notFound();

  return (
    <div className="container-main section-padding">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-[var(--muted)]">
        <Link href="/accounts" className="hover:text-white">
          Browse Accounts
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white line-clamp-1">{account.title}</span>
      </nav>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Gallery + Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Image gallery placeholder */}
          <div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] aspect-video flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <div className="text-5xl font-bold text-white/90">{account.teamStrength}</div>
              <div className="text-sm text-[var(--muted)] mt-2 uppercase tracking-wider">
                Team Strength
              </div>
            </div>
            <span className="absolute top-4 left-4 badge bg-black/60 text-white backdrop-blur-sm">
              {account.platform}
            </span>
            {account.isFeatured && (
              <span className="absolute top-4 right-4 badge bg-[var(--primary)] text-white">
                Featured
              </span>
            )}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white leading-snug">
              {account.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Listed {new Date(account.listedAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {" · "}
              Status: <span className="text-[var(--success)]">{account.status}</span>
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Overall Rating", value: account.overallRating },
              { label: "Coins", value: formatNumber(account.coins) },
              { label: "Players", value: account.playerCount },
              { label: "Manager", value: account.manager },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center"
              >
                <div className="text-lg font-semibold text-white">{stat.value}</div>
                <div className="text-xs text-[var(--muted)] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Player cards */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Special Cards</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-[var(--primary)]">{account.epicPlayers}</div>
                <div className="text-xs text-[var(--muted)]">Epic</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{account.bigTimePlayers}</div>
                <div className="text-xs text-[var(--muted)]">Big Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{account.showTimePlayers}</div>
                <div className="text-xs text-[var(--muted)]">Show Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{account.legendaryPlayers}</div>
                <div className="text-xs text-[var(--muted)]">Legendary</div>
              </div>
            </div>
            {account.featuredPlayers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <p className="text-xs text-[var(--muted)] mb-2">Featured players</p>
                <div className="flex flex-wrap gap-2">
                  {account.featuredPlayers.map((p) => (
                    <span
                      key={p}
                      className="badge bg-[var(--accent)] text-white"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Description</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-line">
              {account.description}
            </p>
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 px-4 py-3 text-sm text-[var(--warning)]">
            Never share passwords, recovery codes, or payment details in public messages.
            Use LOUDEFOOT messaging and follow the official process.
          </div>
        </div>

        {/* Sidebar — Buy + Seller */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sticky top-24">
            <p className="text-3xl font-bold text-white">{formatNaira(account.price)}</p>
            <p className="text-sm text-[var(--muted)] mt-1">Price in Nigerian Naira</p>

            <button
              type="button"
              className="btn btn-primary w-full mt-5 py-3 text-sm"
            >
              Buy Account
            </button>
            <button
              type="button"
              className="btn btn-secondary w-full mt-2 py-3 text-sm"
            >
              ♡ Save to Favourites
            </button>
            <button
              type="button"
              className="btn btn-ghost w-full mt-2 py-2 text-sm"
            >
              Message Seller
            </button>

            <p className="mt-4 text-xs text-[var(--muted-foreground)] text-center">
              Payment verification required. No automatic transfers.
            </p>
          </div>

          {/* Seller card */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Seller</h2>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-medium text-white">
                {account.seller.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-white">{account.seller.username}</span>
                  {account.seller.verified && (
                    <svg className="h-4 w-4 text-[var(--primary)]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-[var(--muted)]">
                  ★ {account.seller.rating} · {account.seller.totalSales} sales
                </p>
              </div>
            </div>
            {account.seller.verified && (
              <p className="mt-3 text-xs text-[var(--primary)]">✓ Verified seller</p>
            )}
          </div>

          {/* Report */}
          <button
            type="button"
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--danger)] w-full text-center"
          >
            Report this listing
          </button>
        </div>
      </div>
    </div>
  );
}
