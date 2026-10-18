import Link from "next/link";
import { adminStats, recentActivity } from "@/data/admin";
import { formatNumber } from "@/lib/format";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

const statCards = [
  { label: "Registered users", value: adminStats.totalUsers, href: "/admin/users" },
  { label: "Active listings", value: adminStats.activeListings, href: "/admin/listings" },
  { label: "Pending listings", value: adminStats.pendingListings, href: "/admin/listings" },
  { label: "Sold accounts", value: adminStats.soldAccounts, href: "/admin/listings" },
  { label: "Exchange offers", value: adminStats.exchangeOffers, href: "/exchange" },
  { label: "Coin orders", value: adminStats.coinOrders, href: "/admin/orders" },
  { label: "Confirmed payments", value: adminStats.confirmedPayments, href: "/admin/orders" },
  { label: "Pending payments", value: adminStats.pendingPayments, href: "/admin/orders" },
  { label: "Disputes / reports", value: adminStats.disputedTransactions, href: "/admin/reports" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Overview</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Platform snapshot · demo numbers until Supabase is connected
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
        {statCards.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 card-hover block"
          >
            <p className="text-2xl font-bold text-white">{formatNumber(s.value)}</p>
            <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Recent activity</h2>
          <ul className="space-y-3">
            {recentActivity.map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 text-sm border-b border-[var(--border-subtle)] pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-white font-medium">{a.action}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{a.detail}</p>
                </div>
                <span className="text-xs text-[var(--muted-foreground)] shrink-0">{a.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Quick actions</h2>
          <div className="grid gap-2">
            <Link href="/admin/listings" className="btn btn-secondary w-full py-2.5 text-sm justify-start">
              Review pending listings ({adminStats.pendingListings})
            </Link>
            <Link href="/admin/orders" className="btn btn-secondary w-full py-2.5 text-sm justify-start">
              Manage coin orders
            </Link>
            <Link href="/admin/packages" className="btn btn-secondary w-full py-2.5 text-sm justify-start">
              Edit coin packages &amp; prices
            </Link>
            <Link href="/admin/reports" className="btn btn-secondary w-full py-2.5 text-sm justify-start">
              Open reports queue ({adminStats.disputedTransactions})
            </Link>
            <Link href="/admin/users" className="btn btn-secondary w-full py-2.5 text-sm justify-start">
              Users &amp; suspensions
            </Link>
          </div>
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            In production, only users with role <code className="text-[var(--primary)]">admin</code> can
            access these routes (enforced server-side via Supabase RLS + middleware).
          </p>
        </div>
      </div>
    </div>
  );
}
