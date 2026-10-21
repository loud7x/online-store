"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Seller = {
  id: string;
  username: string | null;
  is_verified: boolean | null;
  rating: number | null;
};

type SellerListing = {
  id: string;
  title: string;
  price: number;
  status: string | null;
  images: string[] | null;
  created_at: string;
  imageUrl?: string | null;
};

export default function SellerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveImage(listing: SellerListing) {
      const first = Array.isArray(listing.images) ? listing.images[0] : null;

      if (typeof first !== "string" || !first.trim()) return null;

      const value = first.trim();

      if (value.startsWith("https://") || value.startsWith("http://")) {
        return value;
      }

      const path = value.replace(/^\/+/, "").replace(/^account-media\//, "");

      const { data, error } = await supabase.storage
        .from("account-media")
        .createSignedUrl(path, 3600);

      if (error || !data?.signedUrl) return null;

      return data.signedUrl;
    }

    async function load() {
      setLoading(true);

      const { data: sellerData, error: sellerError } = await supabase
        .from("users")
        .select("id, username, is_verified, rating")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (sellerError || !sellerData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setSeller(sellerData as Seller);

      const { data: authData } = await supabase.auth.getUser();
      if (!cancelled) setIsOwner(authData.user?.id === id);

      const { data: listingData } = await supabase
        .from("listings")
        .select("id, title, price, status, images, created_at")
        .eq("seller_id", id)
        .order("created_at", { ascending: false });

      const rows = (listingData ?? []) as SellerListing[];

      const withImages = await Promise.all(
        rows.map(async (listing) =>
          listing.status === "active"
            ? { ...listing, imageUrl: await resolveImage(listing) }
            : listing
        )
      );

      if (cancelled) return;

      setListings(withImages);
      setLoading(false);
    }

    if (id) void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-10">
        <p className="text-center text-[var(--muted)]">Loading profile…</p>
      </main>
    );
  }

  if (notFound || !seller) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-10">
        <div className="mx-auto max-w-md text-center">
          <p className="text-red-400">Seller not found.</p>
          <Link
            href="/accounts"
            className="btn btn-primary mt-5 inline-flex px-5 py-2.5 text-sm"
          >
            Browse Accounts
          </Link>
        </div>
      </main>
    );
  }

  const name = seller.username || "Seller";
  const soldCount = listings.filter((l) => l.status === "sold").length;
  const activeListings = listings.filter((l) => l.status === "active");
  const soldListings = listings.filter((l) => l.status === "sold");

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="container-main py-10">
        {/* Profile header */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xl font-bold text-white">
              {name.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-white">
                <span className="break-all">{name}</span>
                {seller.is_verified && (
                  <span className="rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                    ✓ Verified
                  </span>
                )}
              </h1>

              {(seller.rating ?? 0) > 0 && (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  ★ {seller.rating} rating
                </p>
              )}
            </div>
          </div>

          {/* Trust stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[var(--border)] p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {soldCount}
              </div>
              <div className="mt-1 text-xs text-[var(--muted)]">
                Accounts Sold
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {activeListings.length}
              </div>
              <div className="mt-1 text-xs text-[var(--muted)]">
                Active Listings
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {listings.length}
              </div>
              <div className="mt-1 text-xs text-[var(--muted)]">
                Total Posted
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/my-listings"
                className="btn btn-primary px-5 py-2.5 text-sm"
              >
                Manage My Listings
              </Link>
              <Link
                href="/sell"
                className="btn btn-secondary px-5 py-2.5 text-sm"
              >
                + Sell an Account
              </Link>
            </div>
          )}
        </div>

        {/* Active listings */}
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">
          Active Listings
        </h2>

        {activeListings.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-sm text-[var(--muted)]">
            No active listings right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/accounts/${listing.id}`}
                className="group block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
              >
                <div className="relative aspect-[16/10] bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a]">
                  {listing.imageUrl ? (
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                      No screenshot
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-[15px] font-medium text-white group-hover:text-[var(--primary)]">
                    {listing.title}
                  </h3>
                  <p className="mt-1.5 text-lg font-semibold text-white">
                    ₦{Number(listing.price || 0).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Sold history */}
        {soldListings.length > 0 && (
          <>
            <h2 className="mb-4 mt-10 text-xl font-semibold text-white">
              Sold History
            </h2>
            <div className="space-y-3">
              {soldListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                >
                  <span className="min-w-0 truncate text-sm text-white">
                    {listing.title}
                  </span>
                  <span className="shrink-0 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400">
                    SOLD
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
