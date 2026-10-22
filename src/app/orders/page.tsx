"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { formatNaira } from "@/data/mock";
import { createClient } from "@/lib/supabase/client";

type Row = {
  id: string;
  reference: string;
  title: string;
  amount: number;
  status: string;
  date: string | null;
};

const LABELS: Record<string, string> = {
  pending: "Pending payment",
  paid: "Paid",
  delivered: "Delivered",
  confirmed: "Confirmed",
  released: "Completed",
  failed: "Failed",
};

function statusColor(s: string) {
  if (s === "released" || s === "confirmed") return "text-green-500";
  if (s === "failed") return "text-red-400";
  if (s === "pending") return "text-yellow-500";
  return "text-blue-500";
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const [lookup, setLookup] = useState(searchParams.get("ref") || "");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);

  async function load(ref: string) {
    const supabase = createClient();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoggedIn(false);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("escrow_orders")
      .select("*")
      .eq("buyer_id", user.id);
    if (ref.trim()) query = query.ilike("reference", `%${ref.trim()}%`);
    const { data } = await query;
    const orders = (data || []) as any[];

    // Look up account names from the listings
    const ids = Array.from(new Set(orders.map((o) => o.listing_id)));
    const titles: Record<string, string> = {};
    if (ids.length) {
      const { data: listings } = await supabase
        .from("listings")
        .select("id, title")
        .in("id", ids);
      (listings || []).forEach((l: any) => {
        titles[String(l.id)] = l.title;
      });
    }

    const mapped: Row[] = orders.map((o) => ({
      id: o.id,
      reference: o.reference,
      title: titles[String(o.listing_id)] || "Account purchase",
      amount: Number(o.amount),
      status: o.status,
      date: o.created_at ?? o.paid_at ?? null,
    }));
    mapped.sort((a, b) =>
      String(b.date || "").localeCompare(String(a.date || ""))
    );
    setRows(mapped);
    setLoading(false);
  }

  useEffect(() => {
    load(lookup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-semibold text-white">My orders</h1>
      <p className="mt-1 text-sm text-[var(--muted)] mb-8">
        Track your account purchases.
      </p>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
          placeholder="Search by reference"
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none font-mono"
        />
        <button
          type="button"
          className="btn btn-primary px-5 py-2.5 text-sm"
          onClick={() => load(lookup)}
        >
          Find
        </button>
      </div>

      {loading ? (
        <div className="text-center text-[var(--muted)]">Loading...</div>
      ) : !loggedIn ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-10 text-center text-[var(--muted)]">
          Please log in to see your orders.
          <div className="mt-4">
            <Link href="/login" className="text-[var(--primary)] hover:underline text-sm">
              Log in →
            </Link>
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-10 text-center text-[var(--muted)]">
          No orders yet.
          <div className="mt-4">
            <Link href="/accounts" className="text-[var(--primary)] hover:underline text-sm">
              Browse accounts →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/orders/${r.id}`}
              className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-white">{r.title}</p>
                  <p className="font-mono text-xs text-[var(--muted)] mt-1 break-all">
                    {r.reference}
                  </p>
                </div>
                <span className={`text-xs font-medium shrink-0 ${statusColor(r.status)}`}>
                  {LABELS[r.status] || r.status}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                <span>{formatNaira(r.amount)}</span>
                <span>
                  {r.date
                    ? new Date(r.date).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <div className="container-main section-padding">
      <Suspense fallback={<div className="text-center text-[var(--muted)]">Loading...</div>}>
        <OrdersContent />
      </Suspense>
    </div>
  );
}
