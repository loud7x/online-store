"use client";

import { useState } from "react";
import { adminReports, type AdminReport } from "@/data/admin";

export default function AdminReportsPage() {
  const [reports, setReports] = useState(adminReports);

  function setStatus(id: string, status: AdminReport["status"]) {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Reports &amp; disputes</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Review user reports on listings and accounts
        </p>
      </div>

      <div className="space-y-3">
        {reports.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <p className="text-white font-medium">
                  {r.type === "listing" ? "Listing" : "User"}: {r.target}
                </p>
                <p className="text-sm text-[var(--muted)] mt-1">{r.reason}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Reported by {r.reporter} · {r.createdAt}
                </p>
              </div>
              <span
                className={`text-xs font-medium ${
                  r.status === "pending"
                    ? "text-[var(--warning)]"
                    : r.status === "resolved"
                      ? "text-[var(--success)]"
                      : "text-[var(--muted)]"
                }`}
              >
                {r.status}
              </span>
            </div>
            {r.status === "pending" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStatus(r.id, "reviewed")}
                  className="btn btn-secondary btn-sm text-xs px-3 py-1.5"
                >
                  Mark reviewed
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(r.id, "resolved")}
                  className="btn btn-primary btn-sm text-xs px-3 py-1.5"
                >
                  Resolve
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(r.id, "dismissed")}
                  className="btn btn-ghost btn-sm text-xs px-3 py-1.5"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
