"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { STATUS_LABELS, STATUS_COLORS, type CoinOrder } from "@/data/orders";
import { formatNaira, formatNumber } from "@/data/mock";
import { createClient } from "@/lib/supabase/client";

function OrdersContent() {
  const searchParams = useSearchParams();
  const [lookup, setLookup] = useState(searchParams.get("ref") || "");
  const [orders, setOrders] = useState<CoinOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(ref: string) {
    const supabase = createClient();
    setLoading(true);
    let query = supabase
      .from("coin_orders") // adjust to your table name
      .select("*")
      .order("created_at", { ascending: false });
    if (ref.trim()) query = query.ilike("reference", `%${ref.trim()}%`);
    const { data } = await query;
    setOrders(
      (data || []).map(
        (o: any) =>
          ({
            id: o.id,
            reference: o.reference,
            packageName: o.package_name,
            coins: o.coins,
            platform: o.platform,
            amount: o.amount,
            status: o.status,
            createdAt: o.created_at,
            updatedAt: o.updated_at ?? o.created_at,
          }) as CoinOrder
      )
    );
    setLoading(false);
  }

  useEffect(() => {
    load(lookup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-semibold text-white">Order tracking</h1>
      <p className="mt-1 text-sm text-[var(--muted)] mb-8">
        Look up an order by reference.
      </p>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
          placeholder="e.g. LF-COIN-20261018-A1B2"
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
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-10 text-center text-[var(--muted)]">
          No orders found.
          <div className="mt-4">
            <Link href="/coins" className="text-[var(--primary)] hover:underline text-sm">
              Order coins →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: CoinOrder }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-white">{order.reference}</p>
          <p className="text-sm text-[var(--muted)] mt-1">
            {order.packageName} · {formatNumber(order.coins)} coins · {order.platform}
          </p>
        </div>
        <span className={`text-xs font-medium shrink-0 ${STATUS_COLORS[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span>{formatNaira(order.amount)}</span>
        <span>
          {new Date(order.createdAt).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </Link>
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
