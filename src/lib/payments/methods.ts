import { getPaystackSecretKey } from "./config";

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
    description: "Pay quickly with OPay wallet or bank transfer",
    paystackChannels: ["bank_transfer", "card"],
    recommended: true,
  },
  {
    id: "palmpay",
    name: "PalmPay",
    description: "Pay with PalmPay app or virtual transfer",
    paystackChannels: ["bank_transfer", "card"],
    recommended: true,
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Direct bank transfer (Instant confirmation via automated account)",
    paystackChannels: ["bank_transfer"],
    recommended: true,
  },
  {
    id: "card",
    name: "Debit / Credit Card",
    description: "Pay securely with Visa, Mastercard, or Verve",
    paystackChannels: ["card"],
  },
  {
    id: "ussd",
    name: "USSD Code",
    description: "Pay via short USSD code for supported Nigerian banks",
    paystackChannels: ["ussd"],
  },
  {
    id: "mobile_money",
    name: "Mobile Money",
    description: "Pay using supported mobile wallets",
    paystackChannels: ["mobile_money"],
  },
];

/**
 * Returns the Paystack channels for a payment method.
 * Falls back to card if the method is unknown or has no channels set.
 */
export function paystackChannelsFor(method: PaymentMethodId): string[] {
  const found = PAYMENT_METHODS.find((m) => m.id === method);
  return found?.paystackChannels ?? ["card"];
}

export interface InitializePaymentParams {
  email: string;
  amount: number; // in NGN
  reference: string;
  callbackUrl: string;
  channels?: string[];
  metadata?: Record<string, any>;
}

export async function initializePaystackPayment({
  email,
  amount,
  reference,
  callbackUrl,
  channels,
  metadata,
}: InitializePaymentParams) {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    throw new Error("Paystack secret key is missing from environment variables.");
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // convert NGN to kobo
      reference,
      callback_url: callbackUrl,
      channels,
      metadata,
    }),
  });

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || "Failed to initialize Paystack payment");
  }

  return data.data; // contains authorization_url, access_code, reference
}

export async function verifyPaystackPayment(reference: string) {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    throw new Error("Paystack secret key is missing from environment variables.");
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    }
  );

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || "Paystack transaction verification failed");
  }

  return data.data;
}
