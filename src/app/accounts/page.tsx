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
  const id = params.id as string;

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
      setLoading(false);
    }

    if (id) {
      void loadAccount();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function copySellerNumber(number: string) {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError(
        "Could not copy the number automatically. Please select and copy it manually."
      );
    }
  }

  if (loading) {
    return (
      <main className="container-main section-padding">
        <div className="rounded-xl border border-[var(--border)] p-10 text-center text-[var(--muted)]">
          Loading account...
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="container-main section-padding">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center">
          <p className="text-white">{error || "Account not found."}</p>
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
          className="mb-5 rounded-xl border border-red-500/40 p-4 text-sm text-white"
        >
          {error}
        </div>
      )}

      <article className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="relative flex aspect-[16/10] items-center justify-center bg-black">
          {imageUrl ? (
            <img
              src={imageUrl}
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

        <div className="space-y-3 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--primary)]">
            eFootball · {listing.account_status || "Account"}
          </p>

          <h1 className="font-medium text-white">{listing.title}</h1>

          <p className="text-lg font-semibold text-white">
            {formatNaira(Number(listing.price || 0))}
          </p>

          <div className="rounded-lg border border-[var(--border)] p-3">
            <p className="text-sm font-medium text-white">{sellerName}</p>

            {seller?.is_verified && (
              <p className="mt-1 text-sm text-green-400">✓ Verified seller</p>
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
            <p className="whitespace-pre-wrap break-words text-sm text-[var(--muted)]">
              {listing.account_details}
            </p>
          )}

          {listing.status_notes && (
            <p className="whitespace-pre-wrap break-words text-sm text-[var(--muted)]">
              Account status notes: {listing.status_notes}
            </p>
          )}

          {videoUrl && (
            <details>
              <summary className="cursor-pointer text-sm text-[var(--primary)]">
                Watch account video
              </summary>
              <video
                src={videoUrl}
                controls
                playsInline
                className="mt-3 max-h-72 w-full rounded-lg"
              />
            </details>
          )}

          <p className="border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
            Listed {new Date(listing.created_at).toLocaleDateString("en-NG")}
          </p>

          {isOwner ? (
            <Link
              href="/my-listings"
              className="btn btn-primary inline-flex px-5 py-2.5 text-sm"
            >
              Manage My Listings
            </Link>
          ) : isSold || isArchived ? (
            <p className="rounded-lg border border-[var(--border)] px-3 py-3 text-center text-sm text-[var(--muted)]">
              {isSold
                ? "This account has been sold and is no longer available."
                : "This listing is archived and is no longer available."}
            </p>
          ) : isPending ? (
            <p className="rounded-lg border border-[var(--border)] px-3 py-3 text-center text-sm text-[var(--muted)]">
              This listing is pending and is not currently available.
            </p>
          ) : isAvailable ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Link
                  href={
                    userId
                      ? `/messages?listingId=${encodeURIComponent(listing.id)}`
                      : "/login"
                  }
                  className="btn btn-primary px-3 py-2.5 text-center text-sm"
                >
                  Message Vendor
                </Link>

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
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

              {whatsappDigits && (
                <div className="rounded-lg border border-[var(--border)] p-3">
                  <p className="text-xs text-[var(--muted)]">
                    Seller&apos;s phone number
                  </p>
                  <p className="mt-1 break-all text-base font-semibold text-white">
                    +{whatsappDigits}
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => void copySellerNumber(whatsappDigits)}
                      className="btn px-3 py-2.5 text-sm"
                    >
                      {copied ? "Number Copied ✓" : "Copy Phone Number"}
                    </button>

                    <a
                      href={callUrl ?? undefined}
                      className="btn px-3 py-2.5 text-center text-sm"
                    >
                      Call Seller
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </article>
    </main>
  );
}
