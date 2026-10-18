/**
 * Nigerian-friendly payment methods for LOUDEFOOT.
 * Card, bank transfer, USSD, OPay, and PalmPay are offered in the UI.
 * Live charging still runs through Paystack or Flutterwave when configured.
 */

export type PaymentMethodId =
  | "card"
  | "bank_transfer"
  | "ussd"
  | "opay"
  | "palmpay"
  | "mobile_money";

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  description: string;
  /** Paystack channel hint when applicable */
  paystackChannels?: string[];
  /** Shown as recommended for quick local payments */
  recommended?: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "opay",
    name: "OPay",
    description: "Pay with OPay wallet or transfer",
    paystackChannels: ["bank_transfer", "bank", "ussd"],
    recommended: true,
  },
  {
    id: "palmpay",
    name: "PalmPay",
    description: "Pay with PalmPay wallet or transfer",
    paystackChannels: ["bank_transfer", "bank", "ussd"],
    recommended: true,
  },
  {
    id: "bank_transfer",
    name: "Bank transfer",
    description: "Transfer from any Nigerian bank",
    paystackChannels: ["bank_transfer", "bank"],
  },
  {
    id: "ussd",
    name: "USSD",
    description: "Pay with bank USSD code (*737#, etc.)",
    paystackChannels: ["ussd"],
  },
  {
    id: "card",
    name: "Card",
    description: "Debit / credit card (Visa, Mastercard, Verve)",
    paystackChannels: ["card"],
  },
  {
    id: "mobile_money",
    name: "Other mobile money",
    description: "Other supported mobile wallets",
    paystackChannels: ["mobile_money", "bank_transfer"],
  },
];

export function getMethodById(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

/** Channels to request from Paystack based on selected method */
export function paystackChannelsFor(methodId: PaymentMethodId): string[] {
  const method = getMethodById(methodId);
  return method?.paystackChannels || ["card", "bank", "ussd", "bank_transfer"];
}
