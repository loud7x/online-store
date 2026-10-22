import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaystackPayment } from "@/lib/payments/methods";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("PAYSTACK_SECRET_KEY is missing.");
      return NextResponse.json(
        { error: "Payment configuration is incomplete." },
        { status: 500 }
      );
    }
    // Verify that the webhook came from Paystack.
    const signature = request.headers.get("x-paystack-signature");
    const rawBody = await request.text();
    if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) {
      return NextResponse.json(
        { error: "Invalid signature." },
        { status: 401 }
      );
    }
    const expectedSignature = createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");
    const received = Buffer.from(signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");
    if (
      received.length !== expected.length ||
      !timingSafeEqual(received, expected)
    ) {
      return NextResponse.json(
        { error: "Signature verification failed." },
        { status: 401 }
      );
    }
    let event: {
      event?: string;
      data?: {
        reference?: string;
        amount?: number;
        currency?: string;
      };
    };
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON." },
        { status: 400 }
      );
    }
    // Ignore events that do not represent successful charges.
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }
    const reference = event.data?.reference;
    if (!reference) {
      return NextResponse.json(
        { error: "Missing payment reference." },
        { status: 400 }
      );
    }
    // Confirm the payment directly with Paystack.
    const payment = await verifyPaystackPayment(reference);
    if (
      payment.status !== "success" ||
      payment.reference !== reference ||
      payment.currency !== "NGN" ||
      !Number.isSafeInteger(payment.amount) ||
      payment.amount <= 0
    ) {
      return NextResponse.json(
        { error: "Payment could not be verified." },
        { status: 400 }
      );
    }
    // This webhook currently handles account purchases only.
    // Other payment flows are intentionally left untouched.
    const admin = createAdminClient();
    const { data: order, error: lookupError } = await admin
      .from("escrow_orders")
      .select("id, reference, listing_id, amount, status")
      .eq("reference", reference)
      .maybeSingle();
    if (lookupError) {
      console.error("Escrow order lookup failed:", lookupError.message);
      return NextResponse.json(
        { error: "Could not look up account order." },
        { status: 500 }
      );
    }
    // This may be a valid payment for another flow.
    // Acknowledge it without changing any order.
    if (!order) {
      console.warn("No escrow order found for reference:", reference);
      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }
    // Confirm that the Paystack amount matches the order.
    // Supabase stores the amount in naira; Paystack reports kobo.
    const expectedAmount = Math.round(Number(order.amount) * 100);
    if (
      !Number.isSafeInteger(expectedAmount) ||
      expectedAmount <= 0 ||
      expectedAmount !== payment.amount ||
      event.data?.amount !== payment.amount ||
      event.data?.currency !== payment.currency
    ) {
      console.error("Payment amount mismatch:", reference);
      return NextResponse.json(
        { error: "Payment amount does not match the order." },
        { status: 400 }
      );
    }
    // IMPORTANT:
    // Do not update escrow_orders or listings here.
    // The checkout verification route handles reserving the listing
    // and changing a pending order to paid_held.
    // This prevents the webhook from marking an order held before
    // its listing has been reserved.
    return NextResponse.json({
      received: true,
      verified: true,
      reference,
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}