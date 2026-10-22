import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  initializePaystackPayment,
  paystackChannelsFor,
  type PaymentMethodId,
} from "@/lib/payments/methods";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, method, listingId } = (await request.json()) as {
      email: string;
      method: PaymentMethodId;
      listingId: string;
    };

    if (!email || !method || !listingId) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Read the real price from the database. Never trust the browser.
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, price, status")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: "Listing not found." },
        { status: 404 }
      );
    }

    if (listing.status !== "active") {
      return NextResponse.json(
        { error: "This listing is no longer available." },
        { status: 400 }
      );
    }

    const amount = Number(listing.price);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "This listing has an invalid price." },
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
      metadata: { listing_id: listing.id },
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
