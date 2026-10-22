
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Server configuration is incomplete" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("x-paystack-signature");
  const rawBody = await request.text();

  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) {
    return NextResponse.json(
      { error: "Invalid signature" },
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
      { error: "Signature verification failed" },
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
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = event.data?.reference;
  const amount = event.data?.amount;
  const currency = event.data?.currency;

  if (
    !reference ||
    typeof amount !== "number" ||
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    currency !== "NGN"
  ) {
    return NextResponse.json(
      { error: "Invalid payment details" },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: order, error: lookupError } = await supabase
    .from("orders")
    .select("id, amount_paid, status")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (lookupError) {
    console.error("Order lookup failed:", lookupError.message);
    return NextResponse.json(
      { error: "Could not look up order" },
      { status: 500 }
    );
  }

  if (!order) {
    return NextResponse.json(
      { error: "No matching order found" },
      { status: 404 }
    );
  }

  // Assumes amount_paid is stored in naira.
  // Paystack reports NGN amounts in kobo.
  const expectedAmount = Math.round(Number(order.amount_paid) * 100);

  if (
    !Number.isSafeInteger(expectedAmount) ||
    expectedAmount <= 0 ||
    expectedAmount !== amount
  ) {
    return NextResponse.json(
      { error: "Payment amount does not match order" },
      { status: 400 }
    );
  }

  if (order.status === "paid") {
    return NextResponse.json({ received: true });
  }

  const { data: updatedOrders, error: updateError } = await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("id", order.id)
    .eq("status", order.status)
    .select("id");

  if (updateError) {
    console.error("Order update failed:", updateError.message);
    return NextResponse.json(
      { error: "Could not update order" },
      { status: 500 }
    );
  }

  if (!updatedOrders || updatedOrders.length === 0) {
    return NextResponse.json(
      { error: "Order was not updated; check its current status" },
      { status: 409 }
    );
  }

  return NextResponse.json({ received: true });
}
