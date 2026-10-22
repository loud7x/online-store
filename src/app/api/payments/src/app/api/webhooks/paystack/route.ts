
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    return NextResponse.json(
      { error: "Paystack secret key is not configured" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("x-paystack-signature");

  if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  const rawBody = await request.text();

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

  let event: { event?: string; data?: { reference?: string } };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (event.event === "charge.success") {
    // Next step: update the matching Supabase order
    // only after verifying its payment reference and amount.
    console.log("Successful Paystack payment received:", event.data?.reference);
  }

  return NextResponse.json({ received: true });
}
