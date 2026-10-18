"use client";

import { useMemo, useState } from "react";
import { adminListings, type AdminListing } from "@/data/admin";
import { formatNaira } from "@/lib/format";

type StatusFilter = "all" | AdminListing["status"];

export default function AdminListingsPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [items, setItems] = useState(adminListings);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((l) => l.status === filter);
  }, [items, filter]);

  function setStatus(id: string, status: AdminListing["status"]) {
    setItems((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Listings moderation</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Approve, reject, or remove account listings
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "Under Review", "Available", "Rejected", "Sold"] as StatusFilter[]).map(
            (s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  filter === s
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                {s}
              </button>
            )
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--muted)] border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-3 font-medium">Listing</th>
                <th className="px-4 py-3 font-medium">Seller</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium line-clamp-1 max-w-[220px]">{l.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{l.platform} · {l.createdAt}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{l.seller}</td>
                  <td className="px-4 py-3 text-white whitespace-nowrap">{formatNaira(l.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${
                        l.status === "Available"
                          ? "text-[var(--success)]"
                          : l.status === "Under Review"
                            ? "text-[var(--warning)]"
                            : l.status === "Rejected"
                              ? "text-[var(--danger)]"
                              : "text-[var(--muted)]"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {l.status === "Under Review" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setStatus(l.id, "Available")}
                            className="btn btn-primary btn-sm text-xs px-2 py-1"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(l.id, "Rejected")}
                            className="btn btn-secondary btn-sm text-xs px-2 py-1"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {l.status === "Available" && (
                        <button
                          type="button"
                          onClick={() => setStatus(l.id, "Under Review")}
                          className="btn btn-ghost btn-sm text-xs px-2 py-1"
                        >
                          Unpublish
                        </button>
                      )}
                      {l.status === "Rejected" && (
                        <button
                          type="button"
                          onClick={() => setStatus(l.id, "Under Review")}
                          className="btn btn-ghost btn-sm text-xs px-2 py-1"
                        >
                          Re-queue
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-[var(--muted)]">No listings in this filter.</p>
        )}
      </div>
      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Demo actions update local state only. Wire to Supabase updates + activity_logs in production.
      </p>
    </div>
  );
}
