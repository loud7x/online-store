
import Link from "next/link";
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
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-medium text-white">
        {sellerName.slice(0, 2).toUpperCase()}
      </div>

      <span className="max-w-[100px] truncate text-xs text-[var(--muted)]">
        {sellerName}
      </span>

      {account.seller?.verified && (
        <svg
          className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-label="Verified seller"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </>
  );

  return (
    <div className="group relative block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] card-hover">
      <Link
        href={`/accounts/${account.id}`}
        className="absolute inset-0 z-10"
        aria-label={account.title || "View account"}
      />

      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a]">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={account.title || "eFootball account"}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
          </>
        ) : (
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-white/90">
              {account.teamStrength ?? "eFootball"}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-[var(--muted)]">
              {account.teamStrength ? "Team Strength" : "Account"}
            </div>
          </div>
        )}

        {account.isFeatured && (
          <span className="badge absolute left-3 top-3 bg-[var(--primary)] text-white">
            Featured
          </span>
        )}

        {account.isBestValue && (
          <span className="badge absolute right-3 top-3 bg-[var(--success)] text-white">
            Best Value
          </span>
        )}

        <span className="badge absolute bottom-3 left-3 bg-black/60 text-white backdrop-blur-sm">
          {account.platform || "eFootball"}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-white transition-colors group-hover:text-[var(--primary)]">
            {account.title}
          </h3>

          <p className="mt-1.5 text-lg font-semibold text-white">
            {formatNaira(account.price)}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
          <span>OVR {account.overallRating ?? 0}</span>

          {(account.epicPlayers ?? 0) > 0 && (
            <>
              <span>·</span>
              <span>{account.epicPlayers} Epic</span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2">
          {sellerId ? (
            <Link
              href={`/sellers/${sellerId}`}
              className="relative z-20 flex min-w-0 items-center gap-2 hover:underline"
            >
              {sellerInfo}
            </Link>
          ) : (
            <div className="flex min-w-0 items-center gap-2">
              {sellerInfo}
            </div>
          )}

          {(account.seller?.rating ?? 0) > 0 && (
            <span className="text-xs text-[var(--muted-foreground)]">
              ★ {account.seller.rating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
