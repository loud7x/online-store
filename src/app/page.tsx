import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import AccountCard from "@/components/AccountCard";
import { faqs } from "@/data/mock";

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GAMES = [
  { slug: "efootball", name: "eFootball", tagline: "Player cards, coins & squads" },
  { slug: "freefire", name: "Free Fire", tagline: "Diamonds, skins & ranks" },
  { slug: "codm", name: "CODM", tagline: "Levels, CP & legendary guns" },
];

function toAccount(listing: any, imageUrl: string | null) {
  return {
    ...listing,
    teamStrength: listing.team_strength ?? listing.teamStrength,
    imageUrl,
    seller: {
      username: listing.seller?.username ?? "Seller",
      verified: listing.seller?.is_verified ?? false,
      rating: listing.seller?.rating ?? 0,
    },
  };
}

async function getListingImageUrl(listing: any): Promise<string | null> {
  const imageValue =
    (Array.isArray(listing.images) ? listing.images[0] : null) ||
    listing.account_image_url ||
    listing.image_url ||
    null;

  if (typeof imageValue !== "string" || !imageValue.trim()) {
    return null;
  }

  const value = imageValue.trim();

  if (value.startsWith("https://") || value.startsWith("http://")) {
    return value;
  }

  const path = value
    .replace(/^\/+/, "")
    .replace(/^account-media\//, "");

  if (!path) return null;

  const { data, error } = await supabase.storage
    .from("account-media")
    .createSignedUrl(path, 3600);

  if (error || !data?.signedUrl) {
    console.error("Could not load listing image:", error?.message);
    return null;
  }

  return data.signedUrl;
}

export default async function HomePage() {
  const { data, error } = await supabase
    .from("listings")
    .select("*, seller:seller_id(username, is_verified, rating)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Could not load homepage listings:", error.message);
  }

  const recentAccounts = await Promise.all(
    (data ?? []).map(async (listing: any) => {
      const imageUrl = await getListingImageUrl(listing);
      return toAccount(listing, imageUrl);
    })
  );

  return (
    <>
      {/* Compact Hero */}
      <section>
        <div className="container-main pt-7 pb-8 md:pt-16 md:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)] sm:text-sm">
              LoudVault · Game Account Marketplace
            </p>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              YOUR NEXT GAME ACCOUNT{" "}
              <span className="text-gradient">STARTS HERE.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base md:text-lg">
              Buy, sell and exchange eFootball, Free Fire and CODM accounts.
              Browse real listings from sellers across Nigeria.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center">
              <Link
                href="/accounts"
                className="btn btn-primary px-4 py-3 text-sm sm:px-6 sm:text-base"
              >
                Browse Accounts
              </Link>
              <Link
                href="/sell"
                className="btn btn-secondary px-4 py-3 text-sm sm:px-6 sm:text-base"
              >
                Sell an Account
              </Link>
              <Link
                href="/exchange"
                className="btn btn-secondary col-span-2 justify-self-center px-6 py-2.5 text-sm sm:col-span-1 sm:justify-self-auto sm:px-6 sm:py-3 sm:text-base"
              >
                Exchange Accounts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Game */}
      <section className="section-padding pt-0 md:pt-4">
        <div className="container-main">
          <div className="mb-5 sm:mb-8">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Shop by Game
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
              Pick a game to see its accounts
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
            {GAMES.map((game) => (
              <Link
                key={game.slug}
                href={`/accounts?game=${game.slug}`}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-[var(--primary)] sm:p-6"
              >
                <h3 className="text-lg font-bold text-white">{game.name}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {game.tagline}
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-[var(--primary)] group-hover:underline">
                  Browse {game.name} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      <section className="section-padding pt-5 md:pt-10">
        <div className="container-main">
          <div className="mb-5 flex items-end justify-between gap-3 sm:mb-8">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Recently Added
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                Fresh game accounts from sellers
              </p>
            </div>
            <Link
              href="/accounts"
              className="shrink-0 text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              View all →
            </Link>
          </div>
          {recentAccounts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {recentAccounts.map((account: any) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center sm:p-8">
              <p className="font-semibold text-white">No listings yet</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Be the first to sell a game account.
              </p>
              <Link
                href="/sell"
                className="btn btn-primary mt-5 inline-flex px-5 py-2.5 text-sm"
              >
                Sell an Account
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Best Value + Verified Sellers */}
      <section className="section-padding bg-[var(--card)]/50">
        <div className="container-main">
          <div className="grid gap-5 md:grid-cols-2 md:gap-8">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 md:p-8">
              <h2 className="mb-2 text-lg font-semibold text-white">
                Best-Value Deals
              </h2>
              <p className="mb-6 text-sm text-[var(--muted)]">
                Discover game accounts at competitive prices.
              </p>
              <Link
                href="/accounts?sort=value"
                className="btn btn-primary px-5 py-2.5 text-sm"
              >
                Browse Best Value
              </Link>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 md:p-8">
              <h2 className="mb-2 text-lg font-semibold text-white">
                Verified Sellers
              </h2>
              <p className="mb-6 text-sm text-[var(--muted)]">
                Find verified sellers and review their available account
                listings before contacting them.
              </p>
              <Link
                href="/accounts?verified=true"
                className="btn btn-secondary px-5 py-2.5 text-sm"
              >
                View Verified Listings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How LoudVault Works */}
      <section className="section-padding">
        <div className="container-main">
          <div className="mx-auto mb-8 max-w-xl text-center sm:mb-10">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Simple. Safe. Convenient.
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Find your account on LoudVault and chat with the seller on the
              platform.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
              <h3 className="font-semibold text-white">1. Browse</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                Explore available accounts, photos, videos, prices and account
                status for your favourite game.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
              <h3 className="font-semibold text-white">2. Chat</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                Message the seller on LoudVault to ask questions and confirm
                the account details.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
              <h3 className="font-semibold text-white">3. Pay Securely</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                Pay through LoudVault checkout. Your payment is held until you
                confirm the account is as described. Never pay outside the
                platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-[var(--card)]/50">
        <div className="container-main mx-auto max-w-3xl">
          <h2 className="mb-7 text-center text-xl font-semibold text-white sm:mb-10 sm:text-2xl">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
              >
                <summary className="flex list-none cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-white">
                  {faq.question}
                  <span className="text-[var(--muted)] transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <div className="px-5 pb-4 text-sm leading-relaxed text-[var(--muted)]">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="section-padding">
        <div className="container-main">
          <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--accent)]/20 p-6 text-center sm:p-8 md:p-10">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Need Help?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
              Need help with your listings, account, or using the marketplace?
              Visit our support pages.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="btn btn-primary px-6 py-3 text-sm"
              >
                Contact Support
              </Link>
              <Link
                href="/help"
                className="btn btn-secondary px-6 py-3 text-sm"
              >
                Help Centre
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
