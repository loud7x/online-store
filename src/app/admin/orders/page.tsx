"use client";

import { useState } from "react";
import {
  demoOrders,
  STATUS_LABELS,
  STATUS_COLORS,
  type CoinOrder,
  type OrderStatus,
} from "@/data/orders";
import { formatNaira, formatNumber } from "@/lib/format";

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pending_payment: "payment_confirmed",
  payment_confirmed: "processing",
  processing: "completed",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(demoOrders);

  function advance(id: string) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = NEXT[o.status];
        if (!next) return o;
        return { ...o, status: next, updatedAt: new Date().toISOString() };
      })
    );
  }

  function setStatus(id: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      )
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Coin orders</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Confirm payments and update fulfilment status
        </p>
      </div>

      <div className="space-y-3">
        {orders.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            onAdvance={() => advance(o.id)}
            onHold={() => setStatus(o.id, "on_hold")}
            onCancel={() => setStatus(o.id, "cancelled")}
            onRefund={() => setStatus(o.id, "refunded")}
          />
        ))}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onAdvance,
  onHold,
  onCancel,
  onRefund,
}: {
  order: CoinOrder;
  onAdvance: () => void;
  onHold: () => void;
  onCancel: () => void;
  onRefund: () => void;
}) {
  const canAdvance = Boolean(NEXT[order.status]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-white">{order.reference}</p>
          <p className="text-sm text-[var(--muted)] mt-1">
            {order.packageName} · {formatNumber(order.coins)} coins · {order.platform}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {formatNaira(order.amount)} · Updated{" "}
            {new Date(order.updatedAt).toLocaleString("en-NG")}
          </p>
        </div>
        <span className={`text-sm font-medium ${STATUS_COLORS[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {canAdvance && (
          <button type="button" onClick={onAdvance} className="btn btn-primary btn-sm text-xs px-3 py-1.5">
            Mark next: {STATUS_LABELS[NEXT[order.status]!]}
          </button>
        )}
        {order.status !== "on_hold" && order.status !== "completed" && (
          <button type="button" onClick={onHold} className="btn btn-secondary btn-sm text-xs px-3 py-1.5">
            On hold
          </button>
        )}
        {order.status !== "cancelled" && order.status !== "refunded" && (
          <>
            <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm text-xs px-3 py-1.5">
              Cancel
            </button>
            <button type="button" onClick={onRefund} className="btn btn-ghost btn-sm text-xs px-3 py-1.5 text-[var(--danger)]">
              Refund
            </button>
          </>
        )}
      </div>
    </div>
  );
}
