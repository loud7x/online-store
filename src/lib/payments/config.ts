/**
 * Payment provider configuration.
 * Keys must only be used on the server (API routes / server actions).
 * Never expose secret keys to the client.
 */

export type PaymentProvider = "paystack" | "flutterwave" | "none";

export function getPaymentProvider(): PaymentProvider {
  if (process.env.PAYSTACK_SECRET_KEY) return "paystack";
  if (process.env.FLUTTERWAVE_SECRET_KEY) return "flutterwave";
  return "none";
}

export function getPaystackPublicKey(): string | undefined {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
}

export function getFlutterwavePublicKey(): string | undefined {
  return process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
}

/** Server-only — call only from API routes */
export function getPaystackSecretKey(): string | undefined {
  return process.env.PAYSTACK_SECRET_KEY;
}

export function getFlutterwaveSecretKey(): string | undefined {
  return process.env.FLUTTERWAVE_SECRET_KEY;
}
