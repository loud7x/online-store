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

    // Ask Paystack directly whether this payment really succeeded.
    const verification = await verifyPaystackPayment(reference);

    if (!verification || verification.status !== "success") {
      return NextResponse.json(
        { error: "Transaction was not successful." },
        { status: 400 }
      );
    }

    const result = {
      success: true,
      amount: verification.amount,
      reference: verification.reference,
    };

    // Payments with no listing (for example coin orders) are done here.
    if (!verification.metadata?.listing_id) {
      return NextResponse.json(result);
    }

    const admin = createAdminClient();

    const { data: order, error: orderError } = await admin
      .from("escrow_orders")
      .select("id, status, amount, listing_id")
      .eq("reference", reference)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found for this payment." },
        { status: 404 }
      );
    }

    // Already processed, so nothing more to do.
    if (order.status !== "pending") {
      return NextResponse.json(result);
    }

    // The amount paid must match the order exactly.
    if (verification.amount !== Math.round(Number(order.amount) * 100)) {
      await admin
        .from("escrow_orders")
        .update({ status: "amount_mismatch" })
        .eq("id", order.id);

      return NextResponse.json(
        { error: "Payment amount does not match the order." },
        { status: 400 }
      );
    }

    // Reserve the listing. This works only if it is still active.
    const { data: claimed, error: claimError } = await admin
      .from("listings")
      .update({ status: "reserved" })
      .eq("id", order.listing_id)
      .eq("status", "active")
      .select("id");

    if (claimError || !claimed || claimed.length === 0) {
      await admin
        .from("escrow_orders")
        .update({ status: "needs_refund" })
        .eq("id", order.id);

      return NextResponse.json(
        {
          error:
            "This account was just taken by another buyer. Please contact support for a refund.",
        },
        { status: 409 }
      );
    }

    await admin
      .from("escrow_orders")
      .update({ status: "paid_held", paid_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("status", "pending");

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Server error verifying payment.";
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
