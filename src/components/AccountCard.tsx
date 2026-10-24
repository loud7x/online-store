import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { AccountListing, formatNaira } from "@/data/mock";

interface AccountCardProps {
  account: AccountListing & {
    imageUrl?: string | null;
    seller_id?: string | null;
  };
}

export default function AccountCard({ account }: AccountCardProps) {
  const imageUrl = account.imageUrl;
  const sellerId = account.seller_id;
  const sellerName = account.seller?.username || "Seller";

  const sellerInfo = (
    <>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#142653] text-[9px] font-bold text-white sm:h-6 sm:w-6 sm:text-[10px]">
        {sellerName.slice(0, 2).toUpperCase()}
      </span>
      <span className="max-w-[90px] truncate text-[11px] font-medium text-[var(--muted)] sm:max-w-[120px] sm:text-xs">
        {sellerName}
      </span>
    </>
  );

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#20376b] bg-[#0b1740] transition-colors hover:border-[var(--accent)] sm:rounded-2xl">
      <Link
        href={`/accounts/${account.id}`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--accent)] sm:rounded-2xl"
        aria-label={`View ${account.title || "eFootball account"}`}
      />

      {/* Account Image */}
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-[#142653] via-[#0b1740] to-[#050b24] sm:aspect-[16/10]">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={account.title || "eFootball account"}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050b24]/80 via-transparent to-black/15" />
          </>
        ) : (
          <div className="p-3 text-center sm:p-4">
            <div className="text-2xl font-extrabold text-white sm:text-3xl">
              {account.teamStrength ?? "eFootball"}
            </div>
            <div className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-[#a7b8df] sm:text-xs">
              {account.teamStrength ? "Team Strength" : "Account"}
            </div>
          </div>
        )}
        {account.isFeatured && (
          <span className="absolute left-2 top-2 rounded-md border border-white/10 bg-[#174bff]/95 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white sm:left-3 sm:top-3 sm:text-[10px]">
            Featured
          </span>
        )}
        {account.isBestValue && (
          <span className="absolute right-2 top-2 rounded-md bg-[#ffe600] px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#07102e] sm:right-3 sm:top-3 sm:text-[10px]">
            Best Value
          </span>
        )}
        <span className="absolute bottom-2 left-2 rounded-md border border-white/10 bg-[#050b24]/85 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-sm sm:bottom-3 sm:left-3 sm:text-[10px]">
          {account.platform || "eFootball"}
        </span>
      </div>

      {/* Account Details */}
      <div className="space-y-2 p-2.5 sm:space-y-3 sm:p-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 min-h-[2.4em] break-words text-xs font-bold leading-5 text-white transition-colors group-hover:text-[var(--accent)] sm:text-[15px] sm:leading-snug">
            {account.title}
          </h3>
          <p className="mt-1.5 break-words text-base font-extrabold leading-tight text-[var(--accent)] sm:mt-2 sm:text-xl">
            {formatNaira(account.price)}
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] text-[#a7b8df] sm:gap-x-3 sm:text-xs">
          <span className="rounded bg-[#142653] px-1.5 py-1">
            OVR {account.overallRating ?? 0}
          </span>
          {(account.epicPlayers ?? 0) > 0 && (
            <span className="rounded bg-[#142653] px-1.5 py-1">
              {account.epicPlayers} Epic
            </span>
          )}
        </div>

        {/* Verification Badge */}
        {account.seller?.verified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400 sm:text-xs">
            <MdVerified className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Verified Vendor
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-300 sm:text-xs">
            Unverified seller
          </span>
        )}

        {/* Seller Information */}
        <div className="flex min-w-0 items-center justify-between gap-1 border-t border-[#20376b] pt-2">
          {sellerId ? (
            <Link
              href={`/sellers/${sellerId}`}
              className="relative z-20 flex min-w-0 items-center gap-1.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] sm:gap-2"
              aria-label={`View seller ${sellerName}`}
            >
              {sellerInfo}
            </Link>
          ) : (
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              {sellerInfo}
            </div>
          )}
          {(account.seller?.rating ?? 0) > 0 && (
            <span className="shrink-0 text-[10px] font-semibold text-[var(--accent)] sm:text-xs">
              ★ {account.seller?.rating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
