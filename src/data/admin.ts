/** Demo admin metrics and queues — replace with Supabase queries in production */

export const adminStats = {
  totalUsers: 1284,
  totalListings: 312,
  activeListings: 198,
  soldAccounts: 87,
  pendingListings: 14,
  exchangeOffers: 42,
  coinOrders: 256,
  confirmedPayments: 231,
  pendingPayments: 12,
  disputedTransactions: 3,
};

export const recentActivity = [
  { id: "a1", action: "Listing approved", detail: "2700+ PS5 Account", time: "12 min ago", type: "listing" },
  { id: "a2", action: "Payment confirmed", detail: "LF-COIN-20261018-A1B2 · ₦38,000", time: "28 min ago", type: "payment" },
  { id: "a3", action: "New user registered", detail: "MobileKing", time: "1 hr ago", type: "user" },
  { id: "a4", action: "Report submitted", detail: "Listing acc-006", time: "2 hr ago", type: "report" },
  { id: "a5", action: "Order completed", detail: "LF-COIN-20261017-C3D4", time: "3 hr ago", type: "order" },
  { id: "a6", action: "Listing under review", detail: "Xbox 2500 Rated", time: "5 hr ago", type: "listing" },
];

export interface AdminListing {
  id: string;
  title: string;
  seller: string;
  price: number;
  platform: string;
  status: "Available" | "Under Review" | "Rejected" | "Sold" | "Reserved";
  createdAt: string;
}

export const adminListings: AdminListing[] = [
  { id: "acc-001", title: "2700+ Rated PS5 Account — Full Epic Squad", seller: "ProTradeNG", price: 185000, platform: "PlayStation", status: "Available", createdAt: "2026-10-15" },
  { id: "acc-007", title: "New Android 2200 submission", seller: "NewSeller99", price: 55000, platform: "Android", status: "Under Review", createdAt: "2026-10-18" },
  { id: "acc-008", title: "PC account missing screenshots", seller: "QuickSell", price: 78000, platform: "PC", status: "Under Review", createdAt: "2026-10-18" },
  { id: "acc-002", title: "Android 2400 Rated — Clean Account", seller: "FootyDeals", price: 95000, platform: "Android", status: "Available", createdAt: "2026-10-16" },
  { id: "acc-009", title: "Suspicious low price 2800 account", seller: "DealHunter", price: 25000, platform: "PlayStation", status: "Under Review", createdAt: "2026-10-17" },
  { id: "acc-006", title: "PS4/PS5 2300 Rated — Budget Friendly", seller: "QuickSell", price: 68000, platform: "PlayStation", status: "Available", createdAt: "2026-10-18" },
  { id: "acc-010", title: "Rejected — password in description", seller: "CarelessUser", price: 40000, platform: "iOS", status: "Rejected", createdAt: "2026-10-14" },
];

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  verified: boolean;
  status: "active" | "suspended";
  sales: number;
  joined: string;
}

export const adminUsers: AdminUser[] = [
  { id: "u1", username: "ProTradeNG", email: "pro***@mail.com", role: "seller", verified: true, status: "active", sales: 47, joined: "2026-08-01" },
  { id: "u2", username: "FootyDeals", email: "foo***@mail.com", role: "seller", verified: true, status: "active", sales: 23, joined: "2026-08-12" },
  { id: "u3", username: "MobileKing", email: "mob***@mail.com", role: "seller", verified: false, status: "active", sales: 8, joined: "2026-09-20" },
  { id: "u4", username: "QuickSell", email: "qui***@mail.com", role: "seller", verified: false, status: "active", sales: 12, joined: "2026-09-05" },
  { id: "u5", username: "DealHunter", email: "dea***@mail.com", role: "buyer", verified: false, status: "suspended", sales: 0, joined: "2026-10-10" },
  { id: "u6", username: "AdminLF", email: "adm***@loudefoot.com", role: "admin", verified: true, status: "active", sales: 0, joined: "2026-07-01" },
];

export interface AdminReport {
  id: string;
  type: "listing" | "user";
  target: string;
  reason: string;
  reporter: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
}

export const adminReports: AdminReport[] = [
  { id: "r1", type: "listing", target: "acc-006", reason: "Possible stolen account claim", reporter: "UserX", status: "pending", createdAt: "2026-10-18" },
  { id: "r2", type: "user", target: "DealHunter", reason: "Spam messages", reporter: "ProTradeNG", status: "pending", createdAt: "2026-10-17" },
  { id: "r3", type: "listing", target: "acc-009", reason: "Price too low / scam risk", reporter: "FootyDeals", status: "reviewed", createdAt: "2026-10-16" },
];
