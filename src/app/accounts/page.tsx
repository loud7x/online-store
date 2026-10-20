"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Listing = {
  id: string;
  title: string;
  price: number;
  account_image_url: string;
  account_video_url: string | null;
  account_status: string;
  status_notes: string | null;
  account_details: string | null;
  created_at: string;
};

type DisplayListing = Listing & { imageUrl: string | null; videoUrl: string | null };

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AccountsPage() {
  const [listings, setListings] = useState<DisplayListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from("listings")
        .select("id, title, price, account_image_url, account_video_url, account_status, status_notes, account_details, created_at")
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      const rows = data ?? [];
      const withMedia = await Promise.all(rows.map(async (listing) => {
        const { data: imageData } = await supabase.storage
          .from("account-media")
          .createSignedUrl(listing.account_image_url, 3600);

        let videoUrl: string | null = null;
        if (listing.account_video_url) {
          const { data: videoData } = await supabase.storage
            .from("account-media")
            .createSignedUrl(listing.account_video_url, 3600);
          videoUrl = videoData?.signedUrl ?? null;
        }

        return { ...listing, imageUrl: imageData?.signedUrl ?? null, videoUrl };
      }));

      if (!cancelled) {
        setListings(withMedia);
        setLoading(false);
      }
    }

    loadListings().catch((err: unknown) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : "Could not load accounts.");
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <main className="container-main section-padding">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Browse Accounts</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {loading ? "Loading listings..." : `${listings.length} account${listings.length === 1 ? "" : "s"} available`}
          </p>
        </div>
        <Link href="/sell" className="btn btn-primary px-5 py-2.5 text-sm">Sell an account</Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[var(--border)] p-10 text-center text-[var(--muted)]">Loading accounts from Supabase...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/40 p-6 text-sm text-white">
          <p className="font-semibold">Could not load listings from Supabase.</p>
          <p className="mt-2 break-words">{error}</p>
          <p className="mt-2 text-[var(--muted)]">Check the listings read policy and account-media Storage policy.</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center">
          <p className="text-white">No accounts listed yet.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">When a seller publishes an account, it will appear here.</p>
          <Link href="/sell" className="btn btn-primary mt-5 inline-flex px-5 py-2.5 text-sm">List the first account</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <article key={listing.id} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex aspect-[16/10] items-center justify-center bg-black">
                {listing.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-contain" />
                ) : (
                  <span className="p-4 text-sm text-[var(--muted)]">Account picture unavailable</span>
                )}
              </div>
              <div className="space-y-3 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--primary)]">eFootball · {listing.account_status}</p>
                <h2 className="line-clamp-2 font-medium text-white">{listing.title}</h2>
                <p className="text-lg font-semibold text-white">{formatNaira(Number(listing.price))}</p>
                {listing.account_details && <p className="whitespace-pre-wrap break-words text-sm text-[var(--muted)]">{listing.account_details}</p>}
                {listing.status_notes && <p className="whitespace-pre-wrap break-words text-sm text-[var(--muted)]">Note: {listing.status_notes}</p>}
                {listing.videoUrl && (
                  <details>
                    <summary className="cursor-pointer text-sm text-[var(--primary)]">Watch account video</summary>
                    <video src={listing.videoUrl} controls playsInline className="mt-3 max-h-72 w-full rounded-lg" />
                  </details>
                )}
                <p className="border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
                  Listed {new Date(listing.created_at).toLocaleDateString("en-NG")}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
