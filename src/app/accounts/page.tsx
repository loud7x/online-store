"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Listing = {
  id: string;
  user_id: string;
  title: string;
  price: number;
  images: string[] | null;
  account_status: string | null;
  status: "active" | "pending" | "sold" | "archived" | null;
  created_at: string;
};

type Seller = {
  id: string;
  username: string | null;
  is_verified: boolean | null;
  rating: number | null;
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AccountsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const verifiedOnly = searchParams.get("verified") === "true";

  const [listings, setListings] = useState<Listing[]>([]);
  const [sellers, setSellers] = useState<Record<string, Seller>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function getMediaUrl(path: string | null) {
      try {
        if (!path?.trim()) return null;

        const value = path.trim();
        if (value.startsWith("https://") || value.startsWith("http://")) {
          return value;
        }

        const cleanPath = value
          .replace(/^\/+/, "")
          .replace(/^account-media\//, "");

        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from("account-media")
          .createSignedUrl(cleanPath, 3600);

        if (error) return null;
        return data?.signedUrl ?? null;
      } catch {
        return null;
      }
    }

    async function loadListings() {
      try {
        setLoading(true);
        setError("");

        const supabase = createClient();

        let query = supabase
          .from("listings")
          .select(
            "id, user_id, title, price, images, account_status, status, created_at"
          )
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (search.trim()) {
          query = query.ilike("title", `%${search.trim()}%`);
        }

        if (sort === "price_low") {
          query = query.order("price", { ascending: true });
        } else if (sort === "price_high") {
          query = query.order("price", { ascending: false });
        } else if (sort === "value") {
          query = query.order("price", { ascending: true });
        }

        const { data, error: listError } = await query;

        if (cancelled) return;

        if (listError) {
          setError(listError.message);
          return;
        }

        const accounts = (data as Listing[]) || [];
        setListings(accounts);

        // Fetch sellers
        const userIds = [...new Set(accounts.map((a) => a.user_id))];
        if (userIds.length > 0) {
          const { data: sellersData } = await supabase
            .from("users")
            .select("id, username, is_verified, rating")
            .in("id", userIds);

          if (cancelled) return;

          const sellersMap: Record<string, Seller> = {};
          (sellersData || []).forEach((s: any) => {
            sellersMap[s.id] = s as Seller;
          });
          setSellers(sellersMap);
        }

        // Resolve first images
        const imageMap: Record<string, string | null> = {};
        await Promise.all(
          accounts.map(async (account) => {
            const firstImage = account.images?.[0] ?? null;
            imageMap[account.id] = await getMediaUrl(firstImage);
          })
        );

        if (cancelled) return;
        setImageUrls(imageMap);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadListings();

    return () => {
      cancelled = true;
    };
  }, [search, sort, verifiedOnly]);

  const filteredListings = verifiedOnly
    ? listings.filter((l) => sellers[l.user_id]?.is_verified)
    : listings;

  return (
    <main className="container-main section-padding">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Browse Accounts
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Premium eFootball accounts from verified sellers
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form className="flex-1" action="/accounts" method="get">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by title (e.g. Blitz, Messi...)"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--primary)]"
          />
        </form>

        <div className="flex gap-2 overflow-x-auto">
          <Link
            href="/accounts"
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm ${
              !sort && !verifiedOnly
                ? "bg-[var(--primary)] text-black"
                : "border border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            Newest
          </Link>
          <Link
            href="/accounts?sort=price_low"
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm ${
              sort === "price_low"
                ? "bg-[var(--primary)] text-black"
                : "border border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            Price: Low
          </Link>
          <Link
            href="/accounts?sort=price_high"
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm ${
              sort === "price_high"
                ? "bg-[var(--primary)] text-black"
                : "border border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            Price: High
          </Link>
          <Link
            href="/accounts?verified=true"
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm ${
              verifiedOnly
                ? "bg-[var(--primary)] text-black"
                : "border border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            Verified Only
          </Link>
        </div>
      </div>

      {loading && (
        <div className="py-20 text-center text-[var(--muted)]">
          Loading accounts...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/40 p-6 text-center text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && filteredListings.length === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center">
          <p className="text-white">No accounts found.</p>
          <Link
            href="/accounts"
            className="btn btn-primary mt-5 inline-flex px-5 py-2.5 text-sm"
          >
            Clear filters
          </Link>
        </div>
      )}

      {!loading && filteredListings.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => {
            const seller = sellers[listing.user_id];
            const imageUrl = imageUrls[listing.id];

            return (
              <Link
                key={listing.id}
                href={`/accounts/${listing.id}`}
                className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--primary)]"
              >
                <div className="relative aspect-[16/10] bg-black">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={listing.title}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--primary)]">
                    {listing.account_status || "Account"}
                  </p>

                  <h2 className="mt-1 line-clamp-2 font-medium text-white group-hover:text-[var(--primary)]">
                    {listing.title}
                  </h2>

                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatNaira(Number(listing.price || 0))}
                  </p>

                  {seller && (
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {seller.username || "Seller"}
                      {seller.is_verified && (
                        <span className="ml-1 text-green-400">✓</span>
                      )}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}