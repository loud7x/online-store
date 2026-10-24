import Link from "next/link";
import { formatNaira } from "@/lib/format";
import type { ExchangeOffer } from "@/data/mock";

interface ExchangeCardProps {
  offer: ExchangeOffer;
}

export default function ExchangeCard({ offer }: ExchangeCardProps) {
  const typeColors: Record<string, string> = {
    Equal: "bg-[var(--accent)] text-[var(--primary-foreground)]",
    Upgrade: "bg-[var(--primary)] text-[var(--primary-foreground)]",
    Downgrade: "bg-[var(--border)] text-white",
  };

  const details = [
    offer.platform,
    offer.teamStrength > 0 ? `TS ${offer.teamStrength}` : null,
    `Est. ${formatNaira(offer.estimatedValue)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/exchange/${offer.id}`}
      className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium text-white line-clamp-2">{offer.title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{details}</p>
        </div>
        <span
          className={`badge shrink-0 ${
            typeColors[offer.exchangeType] ||
            "bg-[var(--accent)] text-[var(--primary-foreground)]"
          }`}
        >
          {offer.exchangeType}
        </span>
      </div>

      <p className="mt-3 text-sm text-[var(--muted)] line-clamp-2">
        {offer.description}
      </p>

      {offer.preferred && (
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Looking for:{" "}
          <span className="text-[var(--muted)]">{offer.preferred}</span>
        </p>
      )}

      {offer.additionalCash != null && offer.additionalCash > 0 && (
        <p className="mt-1 text-xs text-[var(--primary)]">
          + {formatNaira(offer.additionalCash)} cash offered
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-medium text-[var(--primary-foreground)]">
          {offer.seller.username.slice(0, 2).toUpperCase()}
        </div>
        <span>{offer.seller.username}</span>
        {offer.seller.verified && (
          <span className="text-[var(--primary)]">✓</span>
        )}
        <span>· ★ {offer.seller.rating}</span>
      </div>
    </Link>
  );
}
