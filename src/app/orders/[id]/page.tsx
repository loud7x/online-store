import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/data/mock";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  pending: "Pending payment",
  paid: "Paid",
  delivered: "Delivered",
  confirmed: "Confirmed",
  released: "Completed",
  failed: "Failed",
};

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleString("en-NG") : null;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: order } = await supabase
    .from("escrow_orders")
    .select("*")
    .eq("id", id)
    .eq("buyer_id", user.id)
    .maybeSingle();
  if (!order) notFound();

  const { data: listing } = await supabase
    .from("listings")
    .select("title")
    .eq("id", order.listing_id)
    .maybeSingle();

  const steps = [
    { label: "Paid", at: fmt(order.paid_at) },
    { label: "Delivered", at: fmt(order.delivered_at) },
    { label: "Confirmed", at: fmt(order.confirmed_at) },
    { label: "Completed", at: fmt(order.released_at) },
  ];

  return (
    <div className="container-main section-padding">
      <nav className="mb-6 text-sm text-[var(--muted)]">
        <Link href="/orders" className="hover:text-white">
          Orders
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white font-mono text-xs">{order.reference}</span>
      </nav>

      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white">
            {listing?.title || "Account purchase"}
          </h1>
          <p className="mt-2 text-sm font-medium text-[var(--primary)]">
            {LABELS[order.status] || order.status}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
          {steps.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  s.at ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                }`}
              />
              <div className="flex-1 flex justify-between text-sm">
                <span className={s.at ? "text-white" : "text-[var(--muted-foreground)]"}>
                  {s.label}
                </span>
                <span className="text-[var(--muted)] text-xs">{s.at || "—"}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-[var(--muted)]">Reference</span>
            <span className="font-mono text-white text-xs break-all text-right">
              {order.reference}
            </span>
          </div>
          <div className="flex justify-between border-t border-[var(--border)] pt-3">
            <span className="text-[var(--muted)]">Amount</span>
            <span className="font-semibold text-white">
              {formatNaira(Number(order.amount))}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/accounts" className="btn btn-secondary flex-1 py-2.5 text-sm text-center">
            Browse accounts
          </Link>
          <Link href="/contact" className="btn btn-ghost flex-1 py-2.5 text-sm text-center">
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
