/**
 * Server-side payment verification helpers.
 * Never trust a frontend "payment success" message alone.
 */

import {
  getPaystackSecretKey,
  getFlutterwaveSecretKey,
  getPaymentProvider,
} from "./config";

export interface VerifyResult {
  success: boolean;
  amount?: number; // kobo for Paystack, or major units depending on provider
  currency?: string;
  reference?: string;
  provider: string;
  raw?: unknown;
  error?: string;
}

export async function verifyPaystackPayment(
  reference: string
): Promise<VerifyResult> {
  const secret = getPaystackSecretKey();
  if (!secret) {
    return { success: false, provider: "paystack", error: "Paystack not configured" };
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (!res.ok || !data.status) {
      return {
        success: false,
        provider: "paystack",
        error: data.message || "Verification failed",
        raw: data,
      };
    }
    const tx = data.data;
    return {
      success: tx.status === "success",
      amount: tx.amount, // kobo
      currency: tx.currency,
      reference: tx.reference,
      provider: "paystack",
      raw: tx,
    };
  } catch (e) {
    return {
      success: false,
      provider: "paystack",
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

export async function verifyFlutterwavePayment(
  transactionId: string
): Promise<VerifyResult> {
  const secret = getFlutterwaveSecretKey();
  if (!secret) {
    return {
      success: false,
      provider: "flutterwave",
      error: "Flutterwave not configured",
    };
  }

  try {
    const res = await fetch(
      `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      return {
        success: false,
        provider: "flutterwave",
        error: data.message || "Verification failed",
        raw: data,
      };
    }
    const tx = data.data;
    return {
      success: tx.status === "successful",
      amount: tx.amount,
      currency: tx.currency,
      reference: tx.tx_ref,
      provider: "flutterwave",
      raw: tx,
    };
  } catch (e) {
    return {
      success: false,
      provider: "flutterwave",
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

export async function verifyPayment(
  reference: string,
  provider?: string
): Promise<VerifyResult> {
  const p = provider || getPaymentProvider();
  if (p === "paystack") return verifyPaystackPayment(reference);
  if (p === "flutterwave") return verifyFlutterwavePayment(reference);
  return {
    success: false,
    provider: "none",
    error: "No payment provider configured. Set PAYSTACK_SECRET_KEY or FLUTTERWAVE_SECRET_KEY.",
  };
}
