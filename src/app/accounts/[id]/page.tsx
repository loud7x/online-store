"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  status: string | null;
  created_at: string;
};

type Seller = {
  id: string;
  username: string | null;
  is_verified: boolean | null;
  rating: number | null;
};

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function getMediaUrl(path: string | null) {
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
    }

    async function loadAccount() {
      setLoading(true);
      setError("");

      const supabase = createClient();

      const { data: authData } = await supabase.auth.getUser();

      if (!cancelled) {
        setUserId(authData.user?.id ?? null);
      }

      // First, find the account using the listing ID in the URL.
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select(
          "id, user_id, title, price, images, account_video_url, account_status, status_notes, account_details, whatsapp_number, status, created_at"
        )
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (listingError) {
        setError(listingError.message);
        setLoading(false);
        return;
      }

      if (!listingData) {
        setError("This account listing could not be found.");
        setLoading(false);
        return;
      }

      const account = listingData as Listing;
      setListing(account);

      // Find the seller using the account owner's user_id.
      const { data: sellerData } = await supabase
        .from("users")
        .select("id, username, is_verified, rating")
        .eq("id", account.user_id)
        .maybeSingle();

      if (cancelled) return;

      // The account remains visible even if the seller profile is missing.
      setSeller((sellerData as Seller | null) ?? null);

      const firstImage = account.images?.[0] ?? null;

      const [resolvedImage, resolvedVideo] = await Promise.all([
        getMediaUrl(firstImage),
        getMediaUrl(account.account_video_url),
      ]);

      if (cancelled) return;

      setImageUrl(resolvedImage);
      setVideoUrl(resolvedVideo);
      setLoading(false);
    }

    if (id) {
      void loadAccount();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function buyAccount() {
    if (!listing) return;

    if (!userId) {
      router.push("/login");
      return;
    }

    if (userId === listing.user_id) {
      setError("You cannot purchase your own account.");
      return;
    }

    if (listing.status !== "active") {
      setError("This account is no longer available.");
      return;
    }

    setBuying(true);
    setError("");

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not start payment.");
      }

      const paymentUrl =
        result.authorization_url ||
        result.authorizationUrl ||
        result.data?.authorization_url;

      if (!paymentUrl) {
        throw new Error("Payment link was not returned. Please try again.");
      }

      window.location.href = paymentUrl;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not start payment."
      );
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <main className="container-main section-padding">
        <p className="py-12 text-center text-[var(--muted)]">
          Loading account...
        </p>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="container-main section-padding">
        <div className="py-12 text-center">
          <p className="text-red-400">
            {error || "Account not found."}
          </p>
          <Link
            href="/accounts"
            className="btn btn-primary mt-5 inline-flex px-5 py-3"
          >
            Browse Accounts
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = userId === listing.user_id;
  const isAvailable = listing.status === "active";
  const sellerName = seller?.username || "Seller";

  const whatsappDigits = (listing.whatsapp_number || "").replace(/\D/g, "");
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}`
    : null;

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
        <div className="space-y-4">
          <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-black">
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

        <div>
          <p className="text-sm font-medium text-[var(--primary)]">
            eFootball · {listing.account_status || "Account"}
          </p>

          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            {listing.title}
          </h1>

          <p className="mt-4 text-3xl font-bold text-white">
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              maximumFractionDigits: 0,
            }).format(Number(listing.price || 0))}
          </p>

          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h2 className="font-semibold text-white">Seller</h2>

            <p className="mt-2 text-white">{sellerName}</p>

            {seller?.is_verified && (
              <p className="mt-1 text-sm text-green-400">
                ✓ Verified seller
              </p>
            )}

            {(seller?.rating ?? 0) > 0 && (
              <p className="mt-1 text-sm text-[var(--muted)]">
                ★ {seller?.rating} rating
              </p>
            )}

            {!seller && (
              <p className="mt-1 text-sm text-[var(--muted)]">
                Seller profile details are unavailable.
              </p>
            )}
          </div>

          {listing.account_details && (
            <div className="mt-6">
              <h2 className="font-semibold text-white">Account details</h2>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-[var(--muted)]">
                {listing.account_details}
              </p>
            </div>
          )}

          {listing.status_notes && (
            <div className="mt-5">
              <h2 className="font-semibold text-white">Account status notes</h2>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-[var(--muted)]">
                {listing.status_notes}
              </p>
            </div>
          )}

          <p className="mt-5 text-xs text-[var(--muted)]">
            Listed {new Date(listing.created_at).toLocaleDateString("en-NG")}
          </p>

          {!isAvailable && (
            <p className="mt-5 rounded-xl border border-red-500/30 p-4 text-sm text-red-300">
              This account is no longer available. Status: {listing.status}
            </p>
          )}

          {isAvailable && !isOwner && (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    userId
                      ? `/messages?listingId=${encodeURIComponent(listing.id)}`
                      : "/login"
                  )
                }
                className="btn px-4 py-3"
              >
                DM Seller
              </button>

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn px-4 py-3 text-center"
                >
                  WhatsApp Seller
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="btn px-4 py-3 opacity-50"
                >
                  WhatsApp not added
                </button>
              )}

              <button
                type="button"
                onClick={() => void buyAccount()}
                disabled={buying}
                className="btn btn-primary px-4 py-3 sm:col-span-2 disabled:opacity-50"
              >
                {buying ? "Opening secure payment..." : "Buy Account"}
              </button>
            </div>
          )}

          {isOwner && (
            <Link
              href="/my-listings"
              className="btn btn-primary mt-6 inline-flex px-5 py-3"
            >
              Manage My Listings
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}