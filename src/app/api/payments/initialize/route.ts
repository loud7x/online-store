import { NextResponse } from "next/server";
import {
  initializePaystackPayment,
  paystackChannelsFor,
  type PaymentMethodId,
} from "@/lib/payments/methods";

export async function POST(request: Request) {
  try {
    const { email, amount, method, listingId } = (await request.json()) as {
      email: string;
      amount: number; // in Naira, e.g. 5000 = ₦5,000
      method: PaymentMethodId;
      listingId?: string;
    };

    if (!email || !amount || !method) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const reference = `LF-${crypto.randomUUID()}`;
    const origin = new URL(request.url).origin;

    // initializePaystackPayment converts NGN to kobo internally
    const data = await initializePaystackPayment({
      email,
      amount,
      reference,
      callbackUrl: `${origin}/checkout/verify`,
      channels: paystackChannelsFor(method),
      metadata: { listing_id: listingId },
    });

    return NextResponse.json({
      authorization_url: data.authorization_url,
      reference: data.reference,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error.";
    console.error("Payment initialize error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
