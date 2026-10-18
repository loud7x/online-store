import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentProvider,
  getPaystackSecretKey,
  getFlutterwaveSecretKey,
} from "@/lib/payments/config";
import { paystackChannelsFor, type PaymentMethodId } from "@/lib/payments/methods";

/**
 * POST /api/payments/initialize
 * Body: { email, amount (NGN), reference, payment_method?, callback_url?, packageId?, platform? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email as string | undefined;
    const amount = Number(body?.amount);
    const reference = body?.reference as string | undefined;
    const paymentMethod = (body?.payment_method as PaymentMethodId) || "card";
    const callbackUrl =
      (body?.callback_url as string) ||
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders`;

    if (!email || !amount || amount <= 0 || !reference) {
      return NextResponse.json(
        { success: false, error: "email, amount (NGN), and reference are required" },
        { status: 400 }
      );
    }

    const provider = getPaymentProvider();
    const channels = paystackChannelsFor(paymentMethod);

    if (provider === "paystack") {
      const secret = getPaystackSecretKey()!;
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // kobo
          reference,
          currency: "NGN",
          callback_url: callbackUrl,
          channels,
          metadata: {
            packageId: body.packageId,
            platform: body.platform,
            payment_method: paymentMethod,
            custom_fields: [
              {
                display_name: "Payment method",
                variable_name: "payment_method",
                value: paymentMethod,
              },
            ],
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.status) {
        return NextResponse.json(
          { success: false, error: data.message || "Paystack init failed" },
          { status: 502 }
        );
      }
      return NextResponse.json({
        success: true,
        provider: "paystack",
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
        payment_method: paymentMethod,
        channels,
      });
    }

    if (provider === "flutterwave") {
      const secret = getFlutterwaveSecretKey()!;
      // Flutterwave: bank_transfer / ussd / card work well for OPay/PalmPay style flows
      const paymentOptions =
        paymentMethod === "card"
          ? "card"
          : paymentMethod === "ussd"
            ? "ussd"
            : "card,banktransfer,ussd,account";

      const res = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: reference,
          amount,
          currency: "NGN",
          redirect_url: callbackUrl,
          payment_options: paymentOptions,
          customer: { email },
          customizations: {
            title: "LOUDEFOOT",
            description: `Coin loading · ${paymentMethod}`,
          },
          meta: {
            packageId: body.packageId,
            platform: body.platform,
            payment_method: paymentMethod,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== "success") {
        return NextResponse.json(
          { success: false, error: data.message || "Flutterwave init failed" },
          { status: 502 }
        );
      }
      return NextResponse.json({
        success: true,
        provider: "flutterwave",
        authorization_url: data.data.link,
        reference,
        payment_method: paymentMethod,
      });
    }

    return NextResponse.json(
      {
        success: false,
        demo: true,
        payment_method: paymentMethod,
        error:
          "No payment provider configured. Set PAYSTACK_SECRET_KEY or FLUTTERWAVE_SECRET_KEY. OPay/PalmPay will work via bank transfer channels once connected.",
      },
      { status: 503 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Initialize request failed" },
      { status: 500 }
    );
  }
}
