"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { createClient } from "@/lib/supabase/client";

type Listing = {
  id: string;
  user_id: string;
  title: string;
  price: number;
  images: string[] | null;
  account_video_url: string | null;
  account_status: string | null;
  status_notes: string | null;
  account_details: string | null;
  whatsapp_number: string | null;
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

export default function AccountDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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

    async function loadAccount(accountId: string) {
      try {
        setLoading(true);
        setError("");

        const supabase = createClient();

        const { data: authData } = await supabase.auth.getUser();
        if (!cancelled) {
          setUserId(authData.user?.id ?? null);
        }

        const { data: listingData, error: listingError } = await supabase
          .from("listings")
          .select(
            "id, user_id, title, price, images, account_video_url, account_status, status_notes, account_details, whatsapp_number, status, created_at"
          )
          .eq("id", accountId)
          .maybeSingle();

        if (cancelled) return;

        if (listingError) {
          setError(listingError.message);
          return;
        }

        if (!listingData) {
          setError("This account listing could not be found.");
          return;
        }

        const account = listingData as Listing;
        setListing(account);

        const { data: sellerData } = await supabase
          .from("users")
          .select("id, username, is_verified, rating")
          .eq("id", account.user_id)
          .maybeSingle();

        if (cancelled) return;
        setSeller((sellerData as Seller | null) ?? null);

        const firstImage = account.images?.[0] ?? null;

        const [resolvedImage, resolvedVideo] = await Promise.all([
          getMediaUrl(firstImage),
          getMediaUrl(account.account_video_url),
        ]);

        if (cancelled) return;

        setImageUrl(resolvedImage);
        setVideoUrl(resolvedVideo);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) {
      void loadAccount(id);
    } else {
      setError("No account selected.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function copySellerNumber(number: string) {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Could not copy the number. Please copy it manually.");
    }
  }

  if (loading) {
    return (
      <main className="container-main section-padding">
        <div className="py-20 text-center text-[var(--muted)]">
          Loading account...
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="container-main section-padding">
        <div className="py-16 text-center">
          <p className="text-red-400">{error || "Account not found."}</p>
          <Link
            href="/accounts"
            className="btn btn-primary mt-6 inline-flex px-5 py-3"
          >
            Browse Accounts
          </Link>
        </div>
      </main>
    );
  }

  const status = listing.status ?? "active";
  const isOwner = !!userId && userId === listing.user_id;
  const isSold = status === "sold";
  const isArchived = status === "archived";
  const isPending = status === "pending";
  const isAvailable = status === "active";
  const sellerName = seller?.username || "Seller";

  const whatsappDigits = (listing.whatsapp_number || "").replace(/\D/g, "");

  const whatsappMessage = `Hi, I'm interested in your eFootball account "${listing.title}" listed on LOUDEFOOT for ${formatNaira(
    Number(listing.price || 0)
  )}. Is it still available?`;

  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const callUrl = whatsappDigits ? `tel:+${whatsappDigits}` : null;

  return (
    <main className="container-main section-padding">
      <Link
        href="/accounts"
        className="mb-6 inline-flex text-sm text-[var(--primary)]"
      >
        ← Back to accounts
      </Link>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-500/40 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column - Media */}
        <div className="space-y-4">
          <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-black">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={listing.title}
                className="max-h-[550px] w-full object-contain"
              />
            ) : (
              <p className="p-8 text-sm text-[var(--muted)]">
                Account picture unavailable
              </p>
            )}

            {/* Status Badges */}
            {isSold && (
              <span className="absolute left-3 top-3 rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white">
                SOLD · UNAVAILABLE
              </span>
            )}
            {isArchived && (
              <span className="absolute left-3 top-3 rounded-md bg-gray-700 px-3 py-1.5 text-xs font-bold tracking-wide text-white">
                ARCHIVED
              </span>
            )}
            {isPending && (
              <span className="absolute left-3 top-3 rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white">
                PENDING
              </span>
            )}
          </div>

          {videoUrl && (
            <video
              src={videoUrl}
              controls
              playsInline
              className="max-h-[450px] w-full rounded-xl bg-black"
            />
          )}
        </div>

        {/* Right Column - Details */}
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">
            eFootball · {listing.account_status || "Account"}
          </p>

          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            {listing.title}
          </h1>

          <p className="mt-4 text-3xl font-bold text-[var(--primary)]">
            {formatNaira(Number(listing.price || 0))}
          </p>

          {/* Status note */}
          {listing.status_notes && (
            <p className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]">
              {listing.status_notes}
            </p>
          )}

          {/* Account details */}
          {listing.account_details && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Account Details
              </h2>
              <div className="whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm leading-relaxed text-white">
                {listing.account_details}
              </div>
            </div>
          )}

          {/* Seller info */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/20 text-sm font-bold text-[var(--primary)]">
              {sellerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white">
                {sellerName}
                {seller?.is_verified && (
                  <span className="ml-2 rounded bg-blue-600/20 px-2 py-0.5 text-xs text-blue-400">
                    Verified
                  </span>
                )}
              </p>
              {seller?.rating != null && (
                <p className="text-sm text-[var(--muted)]">
                  Rating: {seller.rating.toFixed(1)}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 space-y-3">
            {isAvailable && whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex w-full items-center justify-center gap-2 px-5 py-3.5 text-base"
              >
                <FaWhatsapp className="text-xl" />
                Chat on WhatsApp
              </a>
            )}

            {isAvailable && callUrl && (
              <a
                href={callUrl}
                className="btn btn-secondary flex w-full items-center justify-center gap-2 px-5 py-3.5 text-base"
              >
                Call Seller
              </a>
            )}

            {isAvailable && listing.whatsapp_number && (
              <button
                type="button"
                onClick={() => copySellerNumber(listing.whatsapp_number!)}
                className="btn btn-ghost flex w-full items-center justify-center gap-2 px-5 py-3 text-sm"
              >
                {copied ? "Number copied!" : "Copy WhatsApp Number"}
              </button>
            )}

            {isOwner && (
              <Link
                href={`/accounts/${listing.id}/edit`}
                className="btn btn-secondary flex w-full items-center justify-center px-5 py-3"
              >
                Edit Listing
              </Link>
            )}

            {(isSold || isArchived) && (
              <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center text-sm text-[var(--muted)]">
                This account is no longer available.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}