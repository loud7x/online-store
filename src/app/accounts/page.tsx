"use client";"use client";

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
                  </p

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
      setError("No account selected. Open an account from the list.");
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
