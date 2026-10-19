export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  demoOrders,
  STATUS_LABELS,
  STATUS_COLORS,
  type OrderStatus,
} from "@/data/orders";
import { formatNaira, formatNumber } from "@/data/mock";
import type { Metadata } from "next";

const PIPELINE: OrderStatus[] = [
  "pending_payment",
  "payment_confirmed",
  "processing",
  "completed",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = demoOrders.find((o) => o.id === id);
  return { title: order ? `Order ${order.reference}` : "Order" };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = demoOrders.find((o) => o.id === id);
  if (!order) notFound();

  const statusIndex = PIPELINE.indexOf(
    order.status === "on_hold" ||
      order.status === "cancelled" ||
      order.status === "refunded"
      ? "pending_payment"
      : order.status
  );

  return (
    <div className="container-main section-padding">
      <nav className="mb-6 text-sm text-[var(--muted)]">
        <Link href="/orders" className="hover:text-white">
          Orders
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white font-mono text-xs sm:text-sm">{order.reference}</span>
      </nav>

      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Order status</h1>
          <p className={`mt-2 text-sm font-medium ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </p>
        </div>

        {/* Pipeline */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex justify-between gap-1">
            {PIPELINE.map((step, i) => {
              const done = statusIndex >= i;
              const current = statusIndex === i;
              return (
                <div key={step} className="flex-1 text-center">
                  <div
                    className={`mx-auto h-3 w-3 rounded-full ${
                      done ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                    } ${current ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--card)]" : ""}`}
                  />
                  <p
                    className={`mt-2 text-[10px] sm:text-xs leading-tight ${
                      done ? "text-white" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {STATUS_LABELS[step].replace("Payment ", "")}
                  </p>
                </div>
              );
            })}
          </div>
          {(order.status === "on_hold" ||
            order.status === "cancelled" ||
            order.status === "refunded") && (
            <p className={`mt-4 text-sm text-center ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Reference</span>
            <span className="font-mono text-white">{order.reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Package</span>
            <span className="text-white">{order.packageName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Coins</span>
            <span className="text-white">{formatNumber(order.coins)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Platform</span>
            <span className="text-white">{order.platform}</span>
          </div>
          <div className="flex justify-between border-t border-[var(--border)] pt-3">
            <span className="text-[var(--muted)]">Amount</span>
            <span className="font-semibold text-white">{formatNaira(order.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Created</span>
            <span className="text-white">
              {new Date(order.createdAt).toLocaleString("en-NG")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Updated</span>
            <span className="text-white">
              {new Date(order.updatedAt).toLocaleString("en-NG")}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/coins" className="btn btn-secondary flex-1 py-2.5 text-sm text-center">
            Order again
          </Link>
          <Link href="/contact" className="btn btn-ghost flex-1 py-2.5 text-sm text-center">
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
