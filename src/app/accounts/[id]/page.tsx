"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaWhatsapp, FaPhone } from "react-icons/fa";
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
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-center text-sm text-gray-400">Loading account...</p>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="mb-4 text-sm text-red-400">
            {error || "Account not found."}
          </p>
          <Link href="/accounts" className="btn btn-ghost px-5 py-2 text-sm">
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
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/accounts"
        className="mb-6 inline-block text-sm text-gray-400 hover:text-white"
      >
        ← Back to accounts
      </Link>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Media */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/20">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={listing.title}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center text-sm text-gray-500">
                Account picture unavailable
              </div>
            )}

            {/* Status Badges */}
            {isSold && (
              <div className="absolute left-3 top-3 rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white">
                SOLD · UNAVAILABLE
              </div>
            )}
            {isArchived && (
              <div className="absolute left-3 top-3 rounded-md bg-gray-600 px-3 py-1 text-xs font-bold text-white">
                ARCHIVED
              </div>
            )}
            {isPending && (
              <div className="absolute left-3 top-3 rounded-md bg-yellow-500 px-3 py-1 text-xs font-bold text-black">
                PENDING
              </div>
            )}
          </div>

          {videoUrl && (
            <video
              src={videoUrl}
              controls
              className="w-full rounded-xl border border-white/10 bg-black"
            />
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            eFootball · {listing.account_status || "Account"}
          </p>

          <h1 className="text-2xl font-bold">{listing.title}</h1>

          <p className="text-3xl font-extrabold text-green-400">
            {formatNaira(Number(listing.price || 0))}
          </p>

          {/* Status note */}
          {listing.status_notes && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
              {listing.status_notes}
            </div>
          )}

          {/* Account details */}
          {listing.account_details && (
            <div className="rounded-xl border border-white/10 p-4">
              <h2 className="mb-2 text-sm font-semibold">Account Details</h2>
              <p className="whitespace-pre-wrap text-sm text-gray-300">
                {listing.account_details}
              </p>
            </div>
          )}

          {/* Seller info */}
          <div className="flex items-center gap-3 rounded-xl border border-white/10 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold">
              {sellerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                {sellerName}
                {seller?.is_verified && (
                  <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                    Verified
                  </span>
                )}
              </div>
              {seller?.rating != null && (
                <p className="text-xs text-gray-400">
                  Rating: {seller.rating.toFixed(1)}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {isAvailable && whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-500"
              >
                <FaWhatsapp size={18} />
                Chat on WhatsApp
              </a>
            )}

            {isAvailable && callUrl && (
              <a
                href={callUrl}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
              >
                <FaPhone size={16} />
                Phone Vendor
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
                className="btn btn-ghost flex w-full items-center justify-center px-5 py-3 text-sm"
              >
                Edit Listing
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
