"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { createClient } from "@/lib/supabase/client";

type Listing = {
  id: string;
  user_id: string;
  title: string;
  price: number;
  images: string[] | null;
  account_video_url: string | null;
  account_status: string;
  status_notes: string | null;
  account_details: string | null;
  whatsapp_number: string | null;
  status: "active" | "pending" | "sold" | "archived";
  created_at: string;
};

type DisplayListing = Listing & {
  imageUrl: string | null;
  videoUrl: string | null;
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function whatsappLink(number: string) {
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

export default function AccountsPage() {
  const [listings, setListings] = useState<DisplayListing[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();

    setUserId(authData.user?.id ?? null);

    const { data, error: queryError } = await supabase
      .from("listings")
      .select(
        "id, user_id, title, price, images, account_video_url, account_status, status_notes, account_details, whatsapp_number, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setListings([]);
      setLoading(false);
      return;
    }

    const withMedia = await Promise.all(
      (data ?? []).map(async (listing) => {
        const imagePath = listing.images?.[0] ?? null;
        let imageUrl: string | null = null;

        if (imagePath) {
          const { data: imageData } = await supabase.storage
            .from("account-media")
            .createSignedUrl(imagePath, 3600);

          imageUrl = imageData?.signedUrl ?? null;
        }

        let videoUrl: string | null = null;

        if (listing.account_video_url) {
          const { data: videoData } = await supabase.storage
            .from("account-media")
            .createSignedUrl(listing.account_video_url, 3600);

          videoUrl = videoData?.signedUrl ?? null;
        }

        return {
          ...listing,
          status: listing.status ?? "active",
          imageUrl,
          videoUrl,
        } as DisplayListing;
      })
    );

    setListings(withMedia);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  async function changeListingStatus(listing: DisplayListing) {
    if (!userId || listing.user_id !== userId) {
      setActionError("You can only change your own listings.");
      return;
    }

    const nextStatus = listing.status === "sold" ? "active" : "sold";

    const prompt =
      nextStatus === "sold"
        ? "Mark this account as SOLD? Buyers will no longer be able to contact you from this listing."
        : "Mark this account as AVAILABLE again?";

    if (!window.confirm(prompt)) return;

    setBusyId(listing.id);
    setActionError("");

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("listings")
      .update({ status: nextStatus })
      .eq("id", listing.id)
      .eq("user_id", userId);

    if (updateError) {
      setActionError(updateError.message);
    } else {
      await loadListings();
    }

    setBusyId(null);
  }

  async function deleteListing(listing: DisplayListing) {
    if (!userId || listing.user_id !== userId) {
      setActionError("You can only delete your own listings.");
      return;
    }

    if (
      !window.confirm(
        `Delete "${listing.title}" permanently? This cannot be undone.`
      )
    ) {
      return;
    }

    setBusyId(listing.id);
    setActionError("");

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", listing.id)
      .eq("user_id", userId);

    if (deleteError) {
      setActionError(deleteError.message);
    } else {
      setListings((current) =>
        current.filter((item) => item.id !== listing.id)
      );
    }

    setBusyId(null);
  }

  return (
    <main className="container-main section-padding">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            Browse Accounts
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {loading
              ? "Loading listings..."
              : `${listings.length} account${
                  listings.length === 1 ? "" : "s"
                } listed`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/messages" className="btn px-4 py-2.5 text-sm">
            My Messages
          </Link>
          <Link
            href="/sell"
            className="btn btn-primary px-5 py-2.5 text-sm"
          >
            Sell an account
          </Link>
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-500/40 p-4 text-sm text-white"
        >
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[var(--border)] p-10 text-center text-[var(--muted)]">
          Loading accounts from Supabase...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/40 p-6 text-sm text-white">
          <p className="font-semibold">
            Could not load listings from Supabase.
          </p>
          <p className="mt-2 break-words">{error}</p>
          <p className="mt-2 text-[var(--muted)]">
            Check the listings read policy and account-media Storage policy.
          </p>
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center">
          <p className="text-white">No accounts listed yet.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            When a vendor publishes an account, it will appear here.
          </p>
          <Link
            href="/sell"
            className="btn btn-primary mt-5 inline-flex px-5 py-2.5 text-sm"
          >
            List the first account
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => {
            const isOwner =
              !!userId && listing.user_id === userId;
            const isSold = listing.status === "sold";
            const isUnavailable =
              isSold || listing.status === "archived";
            const waUrl = whatsappLink(
              listing.whatsapp_number ?? ""
            );

            return (
              <article
                key={listing.id}
                className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
              >
                <div className="relative flex aspect-[16/10] items-center justify-center bg-black">
                  {listing.imageUrl ? (
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="p-4 text-sm text-[var(--muted)]">
                      Account picture unavailable
                    </span>
                  )}

                  {isSold && (
                    <span className="absolute left-3 top-3 rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white">
                      SOLD · UNAVAILABLE
                    </span>
                  )}

                  {listing.status === "archived" && (
                    <span className="absolute left-3 top-3 rounded-md bg-gray-700 px-3 py-1.5 text-xs font-bold tracking-wide text-white">
                      ARCHIVED
                    </span>
                  )}

                  {listing.status === "pending" && (
                    <span className="absolute left-3 top-3 rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white">
                      PENDING
                    </span>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--primary)]">
                    eFootball · {listing.account_status}
                  </p>

                  <h2 className="line-clamp-2 font-medium text-white">
                    {listing.title}
                  </h2>

                  <p className="text-lg font-semibold text-white">
                    {formatNaira(Number(listing.price))}
                  </p>

                  {listing.account_details && (
                    <p className="whitespace-pre-wrap break-words text-sm text-[var(--muted)]">
                      {listing.account_details}
                    </p>
                  )}

                  {listing.status_notes && (
                    <p className="whitespace-pre-wrap break-words text-sm text-[var(--muted)]">
                      Account status notes: {listing.status_notes}
                    </p>
                  )}

                  {listing.videoUrl && (
                    <details>
                      <summary className="cursor-pointer text-sm text-[var(--primary)]">
                        Watch account video
                      </summary>
                      <video
                        src={listing.videoUrl}
                        controls
                        playsInline
                        className="mt-3 max-h-72 w-full rounded-lg"
                      />
                    </details>
                  )}

                  <p className="border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
                    Listed{" "}
                    {new Date(listing.created_at).toLocaleDateString(
                      "en-NG"
                    )}
                  </p>

                  {isOwner ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={busyId === listing.id}
                        onClick={() =>
                          void changeListingStatus(listing)
                        }
                        className="btn px-3 py-2 text-sm disabled:opacity-50"
                      >
                        {busyId === listing.id
                          ? "Please wait..."
                          : isSold
                            ? "Mark Available"
                            : "Mark as Sold"}
                      </button>

                      <button
                        type="button"
                        disabled={busyId === listing.id}
                        onClick={() => void deleteListing(listing)}
                        className="rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-300 disabled:opacity-50"
                      >
                        Delete Listing
                      </button>
                    </div>
                  ) : isUnavailable ? (
                    <p className="rounded-lg border border-[var(--border)] px-3 py-3 text-center text-sm text-[var(--muted)]">
                      {isSold
                        ? "This account has been sold and is no longer available."
                        : "This listing is archived and is no longer available."}
                    </p>
                  ) : listing.status === "pending" ? (
                    <p className="rounded-lg border border-[var(--border)] px-3 py-3 text-center text-sm text-[var(--muted)]">
                      This listing is pending and is not currently available.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Link
                        href={
                          userId
                            ? `/messages?listingId=${encodeURIComponent(
                                listing.id
                              )}`
                            : "/login"
                        }
                        className="btn btn-primary px-3 py-2.5 text-center text-sm"
                      >
                        Message Vendor
                      </Link>

                      {waUrl ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2.5 text-center text-sm font-semibold text-white active:scale-95"
                        >
                          <FaWhatsapp size={18} />
                          Chat on WhatsApp
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="btn px-3 py-2.5 text-sm opacity-50"
                          title="The vendor has not added a WhatsApp number yet"
                        >
                          WhatsApp not added
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
