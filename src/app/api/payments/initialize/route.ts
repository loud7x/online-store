import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  initializePaystackPayment,
  paystackChannelsFor,
  type PaymentMethodId,
} from "@/lib/payments/methods";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      amount?: number;
      method?: PaymentMethodId;
      listingId?: string;
    };

    const { method, listingId } = body;

    // Coin orders (no listingId) still need a payment method.
    if (!listingId && !method) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const reference = `LF-${crypto.randomUUID()}`;
    const origin = new URL(request.url).origin;
    const callbackUrl = `${origin}/checkout/verify`;
    const channels = method ? paystackChannelsFor(method) : undefined;

    if (!listingId) {
      const { email, amount } = body;

      if (!email || !amount) {
        return NextResponse.json(
          { error: "Missing required fields." },
          { status: 400 }
        );
      }

      const data = await initializePaystackPayment({
        email,
        amount,
        reference,
        callbackUrl,
        channels,
        metadata: {},
      });

      return NextResponse.json({
        authorization_url: data.authorization_url,
        reference: data.reference,
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Please log in to continue." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    const { data: listing, error: listingError } = await admin
      .from("listings")
      .select("id, price, status, user_id")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError) {
      console.error("Listing lookup failed:", listingError.message);
      return NextResponse.json(
        { error: `Listing lookup failed: ${listingError.message}` },
        { status: 500 }
      );
    }

    if (!listing) {
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

    if (listing.user_id === user.id) {
      return NextResponse.json(
        { error: "You cannot buy your own listing." },
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

    const { error: orderError } = await admin.from("escrow_orders").insert({
      reference,
      listing_id: String(listing.id),
      buyer_id: user.id,
      seller_id: listing.user_id,
      amount,
      status: "pending",
    });

    if (orderError) {
      console.error("Could not create order:", orderError.message);
      return NextResponse.json(
        { error: `Could not start your order: ${orderError.message}` },
        { status: 500 }
      );
    }

    try {
      const data = await initializePaystackPayment({
        email: user.email,
        amount,
        reference,
        callbackUrl,
        channels,
        metadata: { listing_id: String(listing.id) },
      });

      return NextResponse.json({
        authorization_url: data.authorization_url,
        reference: data.reference,
      });
    } catch (paystackError) {
      await admin
        .from("escrow_orders")
        .update({ status: "failed" })
        .eq("reference", reference);
      throw paystackError;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error.";
    console.error("Payment initialize error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
