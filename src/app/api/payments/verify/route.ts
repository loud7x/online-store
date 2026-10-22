import { NextResponse } from "next/server";
import { verifyPaystackPayment } from "@/lib/payments/methods";
import { createAdminClient } from "@/lib/supabase/admin";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    if (!reference) {
      return NextResponse.json(
        { error: "Missing transaction reference." },
        { status: 400 }
      );
    }
    // Verify the transaction directly with Paystack.
    const verification = await verifyPaystackPayment(reference);
    if (
      !verification ||
      verification.status !== "success" ||
      verification.reference !== reference ||
      verification.currency !== "NGN" ||
      !Number.isSafeInteger(verification.amount) ||
      verification.amount <= 0
    ) {
      return NextResponse.json(
        { error: "Transaction could not be verified." },
        { status: 400 }
      );
    }
    // Account purchases must include a listing ID in Paystack metadata.
    const listingId = verification.metadata?.listing_id;
    if (!listingId) {
      return NextResponse.json(
        { error: "This payment is not an account purchase." },
        { status: 400 }
      );
    }
    const admin = createAdminClient();
    const { data: order, error: orderError } = await admin
      .from("escrow_orders")
      .select("id, reference, status, amount, listing_id, paid_at")
      .eq("reference", reference)
      .maybeSingle();
    if (orderError) {
      console.error("Escrow order lookup failed:", orderError.message);
      return NextResponse.json(
        { error: "Could not look up the account order." },
        { status: 500 }
      );
    }
    if (!order) {
      return NextResponse.json(
        { error: "Order not found for this payment." },
        { status: 404 }
      );
    }
    if (String(order.listing_id) !== String(listingId)) {
      return NextResponse.json(
        { error: "Payment listing does not match the order." },
        { status: 400 }
      );
    }
    // Paystack reports NGN in kobo; the order amount is stored in naira.
    const expectedAmount = Math.round(Number(order.amount) * 100);
    if (
      !Number.isSafeInteger(expectedAmount) ||
      expectedAmount <= 0 ||
      verification.amount !== expectedAmount
    ) {
      console.error("Payment amount mismatch:", reference);
      return NextResponse.json(
        { error: "Payment amount does not match the order." },
        { status: 400 }
      );
    }
    // If the webhook already processed the order, don't reserve again.
    if (order.status === "paid_held") {
      return NextResponse.json({
        success: true,
        amount: verification.amount,
        reference: verification.reference,
        status: "paid_held",
      });
    }
    // Do not process orders that are no longer awaiting payment.
    if (order.status !== "pending") {
      return NextResponse.json(
        { error: `Order cannot be processed from status: ${order.status}` },
        { status: 409 }
      );
    }
    // Reserve the listing only if it is still active.
    const { data: claimed, error: claimError } = await admin
      .from("listings")
      .update({ status: "reserved" })
      .eq("id", order.listing_id)
      .eq("status", "active")
      .select("id");
    if (claimError) {
      console.error("Listing reservation failed:", claimError.message);
      return NextResponse.json(
        { error: "Could not reserve the listing. Please contact support." },
        { status: 500 }
      );
    }
    if (!claimed || claimed.length === 0) {
      const { error: refundStatusError } = await admin
        .from("escrow_orders")
        .update({ status: "needs_refund" })
        .eq("id", order.id)
        .eq("status", "pending");
      if (refundStatusError) {
        console.error(
          "Could not flag order for refund:",
          refundStatusError.message
        );
      }
      return NextResponse.json(
        {
          error:
            "This account is no longer available. Please contact support about your payment.",
        },
        { status: 409 }
      );
    }
    // Mark the order as paid and held in escrow.
    const { data: updatedOrder, error: updateError } = await admin
      .from("escrow_orders")
      .update({
        status: "paid_held",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("status", "pending")
      .select("id");
    if (updateError || !updatedOrder || updatedOrder.length === 0) {
      console.error(
        "Could not mark escrow order as paid_held:",
        updateError?.message ?? "Order status changed concurrently."
      );
      // The listing was reserved but the order update failed.
      // Do not silently report success; this needs reconciliation.
      return NextResponse.json(
        {
          error:
            "Payment was verified, but order processing needs attention. Please contact support and provide your payment reference.",
          reference,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      amount: verification.amount,
      reference: verification.reference,
      status: "paid_held",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Server error verifying payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}