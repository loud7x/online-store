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
    // Verify that the webhook really came from Paystack.
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
    // We only process successful charges.
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
    // Verify the transaction independently with Paystack.
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
    // This webhook handles account purchases only.
    // Coin purchases and the ordinary orders table are intentionally skipped.
    const admin = createAdminClient();
    const { data: order, error: lookupError } = await admin
      .from("escrow_orders")
      .select("id, reference, listing_id, amount, status, paid_at")
      .eq("reference", reference)
      .maybeSingle();
    if (lookupError) {
      console.error("Escrow order lookup failed:", lookupError.message);
      return NextResponse.json(
        { error: "Could not look up account order." },
        { status: 500 }
      );
    }
    // A valid Paystack event may belong to a different payment flow.
    // Acknowledge it without changing any other order table.
    if (!order) {
      console.warn("No escrow order found for reference:", reference);
      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }
    const expectedAmount = Math.round(Number(order.amount) * 100);
    if (
      !Number.isSafeInteger(expectedAmount) ||
      expectedAmount <= 0 ||
      expectedAmount !== payment.amount ||
      event.data?.amount !== payment.amount ||
      event.data?.currency !== payment.currency
    ) {
      console.error("Payment amount mismatch for reference:", reference);
      // Do not mark the order paid or reserve the listing.
      return NextResponse.json(
        { error: "Payment amount does not match the order." },
        { status: 400 }
      );
    }
    // The verification route reserves the listing and marks the order
    // paid_held. Never overwrite later escrow states from a webhook.
    if (order.status !== "pending") {
      return NextResponse.json({
        received: true,
        alreadyProcessed: true,
        status: order.status,
      });
    }
    // Only record that payment was received and held.
    // The buyer's verification route remains responsible for reserving
    // the listing and moving the order to paid_held.
    const { data: updated, error: updateError } = await admin
      .from("escrow_orders")
      .update({
        status: "paid_held",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("status", "pending")
      .select("id");
    if (updateError) {
      console.error("Escrow order update failed:", updateError.message);
      return NextResponse.json(
        { error: "Could not update account order." },
        { status: 500 }
      );
    }
    if (!updated || updated.length === 0) {
      // Another request may have changed the order concurrently.
      return NextResponse.json({ received: true });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}