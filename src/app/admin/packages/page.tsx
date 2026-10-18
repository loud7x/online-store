"use client";

import { useState } from "react";
import { coinPackages, formatNaira, formatNumber } from "@/data/mock";

type Pkg = (typeof coinPackages)[number];

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState(coinPackages);

  function toggleAvailable(id: string) {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p))
    );
  }

  function updatePrice(id: string, price: number) {
    if (!Number.isFinite(price) || price <= 0) return;
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, price } : p))
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Coin packages</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Create, price, activate, or deactivate packages
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary px-4 py-2 text-sm"
          onClick={() =>
            alert("In production: open create-package modal and insert into coin_packages table.")
          }
        >
          + New package
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {packages.map((pkg) => (
          <PackageEditor
            key={pkg.id}
            pkg={pkg}
            onToggle={() => toggleAvailable(pkg.id)}
            onPrice={(price) => updatePrice(pkg.id, price)}
          />
        ))}
      </div>
    </div>
  );
}

function PackageEditor({
  pkg,
  onToggle,
  onPrice,
}: {
  pkg: Pkg;
  onToggle: () => void;
  onPrice: (n: number) => void;
}) {
  const [priceInput, setPriceInput] = useState(String(pkg.price));

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-white">{pkg.name}</h3>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {formatNumber(pkg.coins)} coins · {pkg.processingTime}
          </p>
        </div>
        {pkg.popular && (
          <span className="badge bg-[var(--primary)] text-white">Popular</span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <label className="text-xs text-[var(--muted)]">Price ₦</label>
        <input
          type="number"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          onBlur={() => onPrice(Number(priceInput))}
          className="w-28 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm text-white"
        />
        <span className="text-xs text-[var(--muted-foreground)]">
          ({formatNaira(pkg.price)})
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`text-xs font-medium ${
            pkg.available ? "text-[var(--success)]" : "text-[var(--muted)]"
          }`}
        >
          {pkg.available ? "Active" : "Inactive"}
        </span>
        <button type="button" onClick={onToggle} className="btn btn-secondary btn-sm text-xs px-3 py-1.5">
          {pkg.available ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}
