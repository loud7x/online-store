export type OrderStatus =
  | "pending_payment"
  | "payment_confirmed"
  | "processing"
  | "completed"
  | "on_hold"
  | "cancelled"
  | "refunded";

export interface CoinOrder {
  id: string;
  reference: string;
  packageId: string;
  packageName: string;
  coins: number;
  amount: number; // NGN
  platform: string;
  status: OrderStatus;
  userNote?: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  payment_confirmed: "Payment Confirmed",
  processing: "Processing",
  completed: "Completed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: "text-[var(--warning)]",
  payment_confirmed: "text-[var(--primary)]",
  processing: "text-[var(--primary)]",
  completed: "text-[var(--success)]",
  on_hold: "text-[var(--warning)]",
  cancelled: "text-[var(--muted)]",
  refunded: "text-[var(--muted)]",
};

export const demoOrders: CoinOrder[] = [
  {
    id: "ord-001",
    reference: "LF-COIN-20261018-A1B2",
    packageId: "coin-02",
    packageName: "Standard Pack",
    coins: 500000,
    amount: 38000,
    platform: "PlayStation",
    status: "processing",
    createdAt: "2026-10-18T09:00:00Z",
    updatedAt: "2026-10-18T09:15:00Z",
  },
  {
    id: "ord-002",
    reference: "LF-COIN-20261017-C3D4",
    packageId: "coin-01",
    packageName: "Starter Pack",
    coins: 100000,
    amount: 8500,
    platform: "Android",
    status: "completed",
    createdAt: "2026-10-17T14:30:00Z",
    updatedAt: "2026-10-17T15:00:00Z",
  },
  {
    id: "ord-003",
    reference: "LF-COIN-20261016-E5F6",
    packageId: "coin-03",
    packageName: "Pro Pack",
    coins: 1000000,
    amount: 72000,
    platform: "PC",
    status: "pending_payment",
    createdAt: "2026-10-16T11:00:00Z",
    updatedAt: "2026-10-16T11:00:00Z",
  },
];

export function generateOrderRef(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LF-COIN-${date}-${rand}`;
}
