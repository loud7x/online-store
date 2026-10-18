import Link from "next/link";
import { AccountListing, formatNaira, formatNumber } from "@/data/mock";

interface AccountCardProps {
  account: AccountListing;
}

export default function AccountCard({ account }: AccountCardProps) {
  return (
    <Link
      href={`/accounts/${account.id}`}
      className="group block rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden card-hover"
    >
      {/* Image placeholder */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-white/90">{account.teamStrength}</div>
          <div className="text-xs text-[var(--muted)] mt-1 uppercase tracking-wider">Team Strength</div>
        </div>
        {account.isFeatured && (
          <span className="absolute top-3 left-3 badge bg-[var(--primary)] text-white">
            Featured
          </span>
        )}
        {account.isBestValue && (
          <span className="absolute top-3 right-3 badge bg-[var(--success)] text-white">
            Best Value
          </span>
        )}
        <span className="absolute bottom-3 left-3 badge bg-black/60 text-white backdrop-blur-sm">
          {account.platform}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-white line-clamp-2 group-hover:text-[var(--primary)] transition-colors text-[15px] leading-snug">
            {account.title}
          </h3>
          <p className="mt-1.5 text-lg font-semibold text-white">
            {formatNaira(account.price)}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
          <span>OVR {account.overallRating}</span>
          <span>·</span>
          <span>{formatNumber(account.coins)} coins</span>
          <span>·</span>
          <span>{account.epicPlayers} Epic</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[10px] font-medium text-white">
              {account.seller.username.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs text-[var(--muted)] truncate max-w-[100px]">
              {account.seller.username}
            </span>
            {account.seller.verified && (
              <svg className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="text-xs text-[var(--muted-foreground)]">
            ★ {account.seller.rating}
          </span>
        </div>
      </div>
    </Link>
  );
}
