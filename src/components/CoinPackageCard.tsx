import Link from "next/link";
import { CoinPackage, formatNaira, formatNumber } from "@/data/mock";

interface CoinPackageCardProps {
  pkg: CoinPackage;
}

export default function CoinPackageCard({ pkg }: CoinPackageCardProps) {
  return (
    <div className="relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-hover flex flex-col">
      {pkg.popular && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 badge bg-[var(--primary)] text-white px-3">
          Popular
        </span>
      )}
      <div className="text-center flex-1">
        <h3 className="font-medium text-white">{pkg.name}</h3>
        <p className="mt-3 text-2xl font-bold text-white">
          {formatNumber(pkg.coins)}
        </p>
        <p className="text-sm text-[var(--muted)]">coins</p>
        <p className="mt-4 text-lg font-semibold text-[var(--primary)]">
          {formatNaira(pkg.price)}
        </p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {pkg.processingTime}
        </p>
      </div>
      <Link
        href={`/coins/${pkg.id}`}
        className={`btn w-full mt-5 py-2.5 text-sm ${
          pkg.available ? "btn-primary" : "btn-secondary opacity-60 pointer-events-none"
        }`}
      >
        {pkg.available ? "Order Now" : "Unavailable"}
      </Link>
    </div>
  );
}
