import Link from "next/link";
import type { ReactNode } from "react";

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/packages", label: "Coin packages" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="container-main py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[var(--primary)] uppercase tracking-wide">
              Admin
            </p>
            <p className="text-sm text-[var(--muted)]">
              LOUDEFOOT control panel · role-based access required in production
            </p>
          </div>
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-white">
            ← Back to site
          </Link>
        </div>
        <div className="container-main flex gap-1 overflow-x-auto pb-3 -mb-px">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm text-[var(--muted)] hover:text-white rounded-md hover:bg-white/5 whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="container-main section-padding">{children}</div>
    </div>
  );
}
