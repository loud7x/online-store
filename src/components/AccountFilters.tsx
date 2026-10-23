"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Platform } from "@/types";

const PLATFORMS: (Platform | "")[] = ["", "PlayStation", "Xbox", "PC", "Android", "iOS"];

const SORT_OPTIONS = [
  { value: "recent", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "strength_desc", label: "Team Strength" },
  { value: "value", label: "Best Value" },
];

export default function AccountFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  // Read search param from either 'search' or 'q' to fix header mismatch
  const queryParam = searchParams.get("search") || searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(queryParam);

  // Keep internal input state in sync with URL search param changes
  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  const current = {
    platform: searchParams.get("platform") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minStrength: searchParams.get("minStrength") || "",
    minEpic: searchParams.get("minEpic") || "",
    verified: searchParams.get("verified") === "true",
    sort: searchParams.get("sort") || "recent",
    search: queryParam,
  };

  const updateParams = useCallback(
    (updates: Record<string, string | boolean>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === false) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Clean up legacy/duplicate key if present
      if (updates.search !== undefined) {
        params.delete("q");
      }

      params.delete("page");
      router.push(`/accounts?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    setSearchInput("");
    router.push("/accounts");
  };

  const hasFilters =
    current.platform ||
    current.minPrice ||
    current.maxPrice ||
    current.minStrength ||
    current.minEpic ||
    current.verified ||
    current.search;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="search"
          placeholder="Search accounts..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              updateParams({ search: searchInput });
            }
          }}
          onBlur={() => {
            if (searchInput !== current.search) {
              updateParams({ search: searchInput });
            }
          }}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 pl-10 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
        />
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="btn btn-secondary px-4 py-2 text-sm"
        >
          Filters {hasFilters && "•"}
        </button>
        <select
          value={current.sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-white"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filters panel */}
      <div className={`${open ? "block" : "hidden"} lg:block space-y-5`}>
        {/* Platform */}
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-2 uppercase tracking-wide">
            Platform
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p || "all"}
                type="button"
                onClick={() => updateParams({ platform: p })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  current.platform === p
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-white"
                }`}
              >
                {p || "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-2 uppercase tracking-wide">
            Price (₦)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              defaultValue={current.minPrice}
              onBlur={(e) => updateParams({ minPrice: e.target.value })}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)]"
            />
            <input
              type="number"
              placeholder="Max"
              defaultValue={current.maxPrice}
              onBlur={(e) => updateParams({ maxPrice: e.target.value })}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)]"
            />
          </div>
        </div>

        {/* Team Strength */}
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-2 uppercase tracking-wide">
            Min Team Strength
          </label>
          <input
            type="number"
            placeholder="e.g. 2400"
            defaultValue={current.minStrength}
            onBlur={(e) => updateParams({ minStrength: e.target.value })}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)]"
          />
        </div>

        {/* Min Epic cards */}
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-2 uppercase tracking-wide">
            Min Epic Cards
          </label>
          <input
            type="number"
            placeholder="0"
            min={0}
            defaultValue={current.minEpic}
            onBlur={(e) => updateParams({ minEpic: e.target.value })}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)]"
          />
        </div>

        {/* Verified only */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={current.verified}
            onChange={(e) => updateParams({ verified: e.target.checked })}
            className="h-4 w-4 rounded border-[var(--border)] bg-[var(--card)] text-[var(--primary)]"
          />
          <span className="text-sm text-[var(--muted)]">Verified sellers only</span>
        </label>

        {/* Desktop sort */}
        <div className="hidden lg:block">
          <label className="block text-xs font-medium text-[var(--muted)] mb-2 uppercase tracking-wide">
            Sort by
          </label>
          <select
            value={current.sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-white"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
