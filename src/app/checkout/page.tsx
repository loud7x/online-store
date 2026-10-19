"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { coinPackages, formatNaira, formatNumber } from "@/data/mock";
import { generateOrderRef } from "@/data/orders";
import {
  PAYMENT_METHODS,
  type PaymentMethodId,
} from "@/lib/payments/methods";

const PLATFORMS = ["PlayStation", "Xbox", "PC", "Android", "iOS"];

function CheckoutForm() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("package") || "coin-02";
  const pkg = coinPackages.find((p) => p.id === packageId) || coinPackages[1];

  const [platform, setPlatform] = useState("PlayStation");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("opay");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{
    reference: string;
    method: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!accepted) {
      setError("Please accept the terms to continue.");
      return;
    }
    setLoading(true);

    const reference = generateOrderRef();
    const methodName =
      PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name || paymentMethod;

    // Try live payment provider if configured
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: pkg.price,
          reference,
          packageId: pkg.id,
          platform,
          payment_method: paymentMethod,
          callback_url:
            typeof window !== "undefined"
              ? `${window.location.origin}/orders?ref=${reference}`
              : undefined,
        }),
      });
      const data = await res.json();

      if (data.success && data.authorization_url) {
        // Redirect to Paystack / Flutterwave checkout
        window.location.href = data.authorization_url;
        return;
      }

      // Provider not configured or demo — complete local demo order
      if (data.demo || res.status === 503) {
        await new Promise((r) => setTimeout(r, 600));
        setDone({ reference, method: methodName });
        setLoading(false);
        return;
      }

      setError(data.error || "Could not start payment. Try another method.");
      setLoading(false);
    } catch {
      // Offline / no server — still allow demo success
      await new Promise((r) => setTimeout(r, 600));
      setDone({ reference, method: methodName });
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
          <div className="text-3xl text-[var(--success)] mb-3">✓</div>
          <h1 className="text-xl font-semibold text-white">Order placed</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Pay with <strong className="text-white">{done.method}</strong> using your order
            reference. When live keys are set, you are redirected to the payment provider.
          </p>
          <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3">
            <p className="text-xs text-[var(--muted)]">Order reference</p>
            <p className="font-mono text-sm text-white mt-1">{done.reference}</p>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {pkg.name} · {formatNumber(pkg.coins)} coins · {formatNaira(pkg.price)}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={`/orders?ref=${done.reference}`}
              className="btn btn-primary py-2.5 text-sm"
            >
              Track order
            </Link>
            <Link href="/coins" className="btn btn-secondary py-2.5 text-sm">
              Back to packages
            </Link>
          </div>
        </div>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Demo mode if Paystack/Flutterwave keys are not set. OPay &amp; PalmPay work through
          bank transfer / wallet channels once a provider is connected.
        </p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8 max-w-4xl mx-auto">
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-semibold text-white mb-2">Checkout</h1>
        <p className="text-sm text-[var(--muted)] mb-8">
          Pay easily with OPay, PalmPay, bank transfer, USSD, or card.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/30 px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          )}

          {/* Payment method */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold text-white mb-1">Payment method</h2>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">
              OPay and PalmPay are recommended for fast local payments in Nigeria.
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const selected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`text-left rounded-lg border px-3 py-3 transition-colors ${
                      selected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[#3f3f46]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-white">{method.name}</span>
                      {method.recommended && (
                        <span className="badge bg-[var(--primary)] text-white text-[10px]">
                          Easy
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{method.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Order details</h2>

            <div>
              <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">
                Platform
              </label>
              <select
                required
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white focus:border-[var(--primary)] focus:outline-none"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">
                Email (order updates)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">
                Notes (optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Do not include passwords or OTP codes"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 px-4 py-3 text-sm text-[var(--warning)]">
            We never ask for Konami passwords or one-time codes here. OPay/PalmPay payments
            go through the secure payment provider — LOUDEFOOT does not store your wallet PIN.
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--border)]"
            />
            <span className="text-xs text-[var(--muted)] leading-relaxed">
              I accept the{" "}
              <Link href="/terms" className="text-[var(--primary)] hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/refunds" className="text-[var(--primary)] hover:underline">
                Refund Policy
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !pkg.available}
            className="btn btn-primary w-full py-3 text-sm disabled:opacity-60"
          >
            {loading
              ? "Processing..."
              : `Pay ${formatNaira(pkg.price)} with ${
                  PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name || "selected method"
                }`}
          </button>

          <p className="text-xs text-[var(--muted-foreground)] text-center">
            Powered by Paystack / Flutterwave when configured · ₦ NGN
          </p>
        </form>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sticky top-24">
          <h2 className="text-sm font-semibold text-white mb-4">Order summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Package</span>
              <span className="text-white">{pkg.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Coins</span>
              <span className="text-white">{formatNumber(pkg.coins)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Pay with</span>
              <span className="text-white">
                {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name}
              </span>
            </div>
            <div className="border-t border-[var(--border)] pt-3 flex justify-between">
              <span className="font-medium text-white">Total</span>
              <span className="font-semibold text-white text-lg">
                {formatNaira(pkg.price)}
              </span>
            </div>
          </div>
          <Link
            href="/coins"
            className="block text-center text-xs text-[var(--primary)] mt-4 hover:underline"
          >
            Change package
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="container-main section-padding">
      <Suspense
        fallback={
          <div className="text-center text-[var(--muted)] py-12">Loading checkout...</div>
        }
      >
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
