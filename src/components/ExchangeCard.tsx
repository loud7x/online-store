import Link from "next/link";
import { formatNaira } from "@/lib/format";
import type { ExchangeOffer } from "@/data/mock";

interface ExchangeCardProps {
  offer: ExchangeOffer;
}

export default function ExchangeCard({ offer }: ExchangeCardProps) {
  const typeColors: Record<string, string> = {
    Equal: "bg-[var(--accent)]",
    Upgrade: "bg-[var(--primary)]",
    Downgrade: "bg-[var(--muted-foreground)]",
  };

  return (
    <Link
      href={`/exchange/${offer.id}`}
      className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium text-white line-clamp-2">{offer.title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {offer.platform} · TS {offer.teamStrength} · Est. {formatNaira(offer.estimatedValue)}
          </p>
        </div>
        <span className={`badge text-white shrink-0 ${typeColors[offer.exchangeType] || "bg-[var(--accent)]"}`}>
          {offer.exchangeType}
        </span>
      </div>

      <p className="mt-3 text-sm text-[var(--muted)] line-clamp-2">{offer.description}</p>

      {offer.preferred && (
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Looking for: <span className="text-[var(--muted)]">{offer.preferred}</span>
        </p>
      )}

      {offer.additionalCash != null && offer.additionalCash > 0 && (
        <p className="mt-1 text-xs text-[var(--primary)]">
          + {formatNaira(offer.additionalCash)} cash offered
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <div className="h-6 w-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[10px] font-medium text-white">
          {offer.seller.username.slice(0, 2).toUpperCase()}
        </div>
        <span>{offer.seller.username}</span>
        {offer.seller.verified && <span className="text-[var(--primary)]">✓</span>}
        <span>· ★ {offer.seller.rating}</span>
      </div>
    </Link>
  );
}
