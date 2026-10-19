export const dynamic = "force-dynamic";
import { Suspense } from "react";
import AccountCard from "@/components/AccountCard";
import AccountFilters from "@/components/AccountFilters";
import { featuredAccounts, recentAccounts } from "@/data/mock";
import type { AccountListing as MockListing } from "@/data/mock";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Accounts",
  description: "Browse eFootball accounts for sale. Filter by platform, price, team strength and more.",
};

// Combine mock data for Stage 2 demo
const allListings: MockListing[] = [...featuredAccounts, ...recentAccounts];

function filterListings(
  listings: MockListing[],
  params: Record<string, string | undefined>
) {
  let result = [...listings];

  if (params.platform) {
    result = result.filter((l) => l.platform === params.platform);
  }
  if (params.minPrice) {
    result = result.filter((l) => l.price >= Number(params.minPrice));
  }
  if (params.maxPrice) {
    result = result.filter((l) => l.price <= Number(params.maxPrice));
  }
  if (params.minStrength) {
    result = result.filter((l) => l.teamStrength >= Number(params.minStrength));
  }
  if (params.minEpic) {
    result = result.filter((l) => l.epicPlayers >= Number(params.minEpic));
  }
  if (params.verified === "true") {
    result = result.filter((l) => l.seller.verified);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    result = result.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.platform.toLowerCase().includes(q)
    );
  }

  // Sort
  switch (params.sort) {
    case "price_asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "strength_desc":
      result.sort((a, b) => b.teamStrength - a.teamStrength);
      break;
    case "value":
      result.sort((a, b) => {
        const va = a.teamStrength / a.price;
        const vb = b.teamStrength / b.price;
        return vb - va;
      });
      break;
    default:
      result.sort(
        (a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime()
      );
  }

  return result;
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const filtered = filterListings(allListings, params);

  return (
    <div className="container-main section-padding">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">
          Browse Accounts
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {filtered.length} account{filtered.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-64 shrink-0">
          <div className="lg:sticky lg:top-24">
            <Suspense fallback={<div className="text-sm text-[var(--muted)]">Loading filters...</div>}>
              <AccountFilters />
            </Suspense>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center">
              <p className="text-[var(--muted)]">No accounts match your filters.</p>
              <a href="/accounts" className="btn btn-primary mt-4 px-5 py-2.5 text-sm inline-flex">
                Clear filters
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((acc) => (
                <AccountCard key={acc.id} account={acc} />
              ))}
            </div>
          )}

          <p className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
            Demo listings — real data will load from Supabase once configured.
          </p>
        </div>
      </div>
    </div>
  );
}
