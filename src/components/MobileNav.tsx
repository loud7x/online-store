"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/", icon: "⌂" },
  { label: "Accounts", href: "/accounts", icon: "🎮" },
  { label: "Sell", href: "/sell", icon: "+" },
  { label: "My Listings", href: "/my-listings", icon: "▤" },
  { label: "Profile", href: "/profile", icon: "◉" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="mobile-bottom-nav"
    >
      {navItems.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={`mobile-nav-item${active ? " active" : ""}${
              item.label === "Sell" ? " mobile-nav-sell" : ""
            }`}
          >
            <span className="mobile-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
