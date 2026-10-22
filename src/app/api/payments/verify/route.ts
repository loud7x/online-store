
import { NextResponse } from "next/server";
import { verifyPaystackPayment } from "@/lib/payments/methods";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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

    // Verify the payment directly with Paystack.
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
      .select("id, reference, status, amount, listing_id")
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

    // The order amount is in naira; Paystack returns kobo.
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

    // Confirm the order and reserve the listing in one database transaction.
    const { data: confirmation, error: confirmError } = await admin.rpc(
      "confirm_account_payment",
      {
        p_reference: reference,
        p_verified_amount_kobo: verification.amount,
      }
    );

    if (confirmError) {
      console.error(
        "Atomic payment confirmation failed:",
        confirmError.message
      );

      return NextResponse.json(
        {
          error:
            "Payment was verified, but order confirmation needs attention. Please contact support with your payment reference.",
          reference,
        },
        { status: 500 }
      );
    }

    if (!confirmation?.ok) {
      const code = confirmation?.code;

      if (code === "listing_unavailable") {
        return NextResponse.json(
          {
            error:
              "This account is no longer available. Please contact support about your payment.",
            reference,
          },
          { status: 409 }
        );
      }

      if (code === "order_not_found") {
        return NextResponse.json(
          { error: "Order not found for this payment." },
          { status: 404 }
        );
      }

      if (code === "amount_mismatch") {
        return NextResponse.json(
          { error: "Payment amount does not match the order." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: `Order cannot be confirmed: ${code ?? "unknown error"}`,
          reference,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      amount: verification.amount,
      reference: verification.reference,
      status: confirmation.status,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { error: "Server error verifying payment." },
      { status: 500 }
    );
  }
}
