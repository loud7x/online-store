import Link from "next/link";
import AccountCard from "@/components/AccountCard";
import CoinPackageCard from "@/components/CoinPackageCard";
import {
  featuredAccounts,
  recentAccounts,
  coinPackages,
  exchangeOffers,
  testimonials,
  faqs,
  formatNaira,
} from "@/data/mock";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/10 via-transparent to-transparent pointer-events-none" />
        <div className="container-main pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium text-[var(--primary)] mb-4 tracking-wide uppercase">
              eFootball Marketplace
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              YOUR NEXT eFOOTBALL ACCOUNT{" "}
              <span className="text-gradient">STARTS HERE.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
              Buy, sell, exchange accounts, and get your eFootball coins loaded — all in one place.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/accounts" className="btn btn-primary px-6 py-3 text-sm sm:text-base">
                Browse Accounts
              </Link>
              <Link href="/sell" className="btn btn-secondary px-6 py-3 text-sm sm:text-base">
                Sell an Account
              </Link>
              <Link href="/exchange" className="btn btn-secondary px-6 py-3 text-sm sm:text-base">
                Exchange Accounts
              </Link>
              <Link href="/coins" className="btn btn-secondary px-6 py-3 text-sm sm:text-base">
                Buy Coins
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Accounts */}
      <section className="section-padding">
        <div className="container-main">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white">Featured Accounts</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Hand-picked high-value listings</p>
            </div>
            <Link href="/accounts" className="text-sm text-[var(--primary)] hover:underline shrink-0">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredAccounts.map((acc) => (
              <AccountCard key={acc.id} account={acc} />
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      <section className="section-padding bg-[var(--card)]/50">
        <div className="container-main">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white">Recently Added</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Fresh listings from sellers</p>
            </div>
            <Link href="/accounts?sort=recent" className="text-sm text-[var(--primary)] hover:underline shrink-0">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentAccounts.map((acc) => (
              <AccountCard key={acc.id} account={acc} />
            ))}
          </div>
        </div>
      </section>

      {/* Best Value + Verified Sellers highlight */}
      <section className="section-padding">
        <div className="container-main">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
              <h2 className="text-lg font-semibold text-white mb-2">Best-Value Deals</h2>
              <p className="text-sm text-[var(--muted)] mb-6">
                Strong accounts at competitive prices. Look for the green “Best Value” badge.
              </p>
              <Link href="/accounts?sort=value" className="btn btn-primary px-5 py-2.5 text-sm">
                Browse Best Value
              </Link>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
              <h2 className="text-lg font-semibold text-white mb-2">Verified Sellers</h2>
              <p className="text-sm text-[var(--muted)] mb-6">
                Trade with confidence. Verified sellers have completed identity checks and maintain strong ratings.
              </p>
              <Link href="/accounts?verified=true" className="btn btn-secondary px-5 py-2.5 text-sm">
                View Verified Listings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Coin Loading */}
      <section className="section-padding bg-[var(--card)]/50">
        <div className="container-main">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Coin Loading Services</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Fast, tracked coin packages. Choose a pack, place your order, and follow status updates.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {coinPackages.map((pkg) => (
              <CoinPackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
            We do not request or store Konami account passwords or one-time codes as part of the normal process.
          </p>
        </div>
      </section>

      {/* Latest Exchange Offers */}
      <section className="section-padding">
        <div className="container-main">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white">Latest Exchange Offers</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Trade accounts with other players</p>
            </div>
            <Link href="/exchange" className="text-sm text-[var(--primary)] hover:underline shrink-0">
              Open Exchange Hub →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {exchangeOffers.map((offer) => (
              <Link
                key={offer.id}
                href={"/exchange/" + offer.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-hover block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-white">{offer.title}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {offer.platform} · TS {offer.teamStrength} · Est. {formatNaira(offer.estimatedValue)}
                    </p>
                  </div>
                  <span className="badge bg-[var(--accent)] text-white shrink-0">
                    {offer.exchangeType}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[var(--muted)] line-clamp-2">{offer.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <span>{offer.seller.username}</span>
                  {offer.seller.verified && <span className="text-[var(--primary)]">✓ Verified</span>}
                  <span>· ★ {offer.seller.rating}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-[var(--card)]/50">
        <div className="container-main">
          <h2 className="text-xl sm:text-2xl font-semibold text-white text-center mb-10">
            What Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
              >
                <div className="flex gap-0.5 text-[var(--warning)] mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-sm text-[var(--muted)] leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
            Sample testimonials for demonstration purposes only.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container-main max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-semibold text-white text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-white list-none">
                  {faq.question}
                  <span className="text-[var(--muted)] group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-5 pb-4 text-sm text-[var(--muted)] leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/faq" className="text-sm text-[var(--primary)] hover:underline">
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="section-padding bg-[var(--card)]/50">
        <div className="container-main">
          <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--accent)]/20 p-8 md:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Need Help?</h2>
            <p className="mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
              Our support team is available to assist with orders, listings, and account questions.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn btn-primary px-6 py-3 text-sm">
                Contact Support
              </Link>
              <Link href="/help" className="btn btn-secondary px-6 py-3 text-sm">
                Help Centre
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
