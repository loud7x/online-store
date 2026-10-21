
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Listing = {
  id: string;
  title: string;
  price: number;
  status: string | null;
  listing_status: string | null;
  created_at: string;
  images: string[] | null;
};

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const supabase = createClient();

  async function loadListings() {
    setLoading(true);
    setMessage("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setMessage("Please log in to view your listings.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .select(
        "id, title, price, status, listing_status, created_at, images"
      )
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Could not load listings: " + error.message);
      setLoading(false);
      return;
    }

    setListings((data ?? []) as Listing[]);
    setLoading(false);
  }

  useEffect(() => {
    void loadListings();
  }, []);

  async function markAsSold(listing: Listing) {
    const confirmed = window.confirm(
      `Mark "${listing.title}" as sold?`
    );

    if (!confirmed) return;

    setBusyId(listing.id);
    setMessage("");

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setMessage("Please log in again.");
      setBusyId(null);
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .update({
        status: "sold",
        listing_status: "sold",
      })
      .eq("id", listing.id)
      .eq("user_id", authData.user.id)
      .select("id");

    if (error) {
      setMessage("Could not mark as sold: " + error.message);
    } else if (!data || data.length === 0) {
      setMessage(
        "No listing was updated. Check your listing permissions."
      );
    } else {
      setMessage("Listing marked as sold.");
      await loadListings();
    }

    setBusyId(null);
  }

  async function deleteListing(listing: Listing) {
    const confirmed = window.confirm(
      `Permanently delete "${listing.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setBusyId(listing.id);
    setMessage("");

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setMessage("Please log in again.");
      setBusyId(null);
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listing.id)
      .eq("user_id", authData.user.id)
      .select("id");

    if (error) {
      setMessage("Could not delete listing: " + error.message);
    } else if (!data || data.length === 0) {
      setMessage(
        "No listing was deleted. Check your listing permissions."
      );
    } else {
      setMessage("Listing deleted successfully.");
      await loadListings();
    }

    setBusyId(null);
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="container-main py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              My Listings
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Manage your eFootball accounts on LOUDEFOOT.
            </p>
          </div>

          <Link
            href="/sell"
            className="btn btn-primary px-5 py-3 text-sm"
          >
            + Sell an Account
          </Link>
        </div>

        {message && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-white"
          >
            {message}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-[var(--muted)]">
            Loading your listings...
          </p>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <h2 className="text-xl font-semibold text-white">
              No listings found
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Accounts you post will appear here.
            </p>
            <Link
              href="/sell"
              className="btn btn-primary mt-5 inline-flex px-5 py-3 text-sm"
            >
              Post Your First Account
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {listings.map((listing) => {
              const currentStatus =
                listing.status || listing.listing_status || "unknown";
              const sold = currentStatus === "sold";

              return (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-white">
                          {listing.title}
                        </h2>
                        <p className="mt-2 text-xl font-bold text-[var(--primary)]">
                          ₦{Number(listing.price || 0).toLocaleString()}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          sold
                            ? "bg-red-500/15 text-red-400"
                            : currentStatus === "active"
                            ? "bg-green-500/15 text-green-400"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        {currentStatus.toUpperCase()}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[var(--muted)]">
                      Posted{" "}
                      {listing.created_at
                        ? new Date(
                            listing.created_at
                          ).toLocaleDateString()
                        : "date unavailable"}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={`/accounts/${listing.id}`}
                        className="btn btn-secondary px-4 py-2 text-sm"
                      >
                        View
                      </Link>

                      {!sold && (
                        <button
                          type="button"
                          disabled={busyId === listing.id}
                          onClick={() => void markAsSold(listing)}
                          className="btn btn-primary px-4 py-2 text-sm disabled:opacity-50"
                        >
                          {busyId === listing.id
                            ? "Please wait..."
                            : "Mark as Sold"}
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={busyId === listing.id}
                        onClick={() => void deleteListing(listing)}
                        className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
