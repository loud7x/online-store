import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/payments/verify";

/**
 * POST /api/payments/verify
 * Body: { reference: string, provider?: "paystack" | "flutterwave" }
 * Always verify on the server. Never trust a client-only success callback.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reference = body?.reference as string | undefined;
    const provider = body?.provider as string | undefined;

    if (!reference || typeof reference !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing payment reference" },
        { status: 400 }
      );
    }

    const result = await verifyPayment(reference, provider);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Payment not verified",
          provider: result.provider,
        },
        { status: 402 }
      );
    }

    // TODO when Supabase connected:
    // Find order by reference, match amount, set payment_confirmed, prevent duplicates

    return NextResponse.json({
      success: true,
      reference: result.reference,
      amount: result.amount,
      currency: result.currency,
      provider: result.provider,
      message: "Payment verified. Wire order status update when DB is connected.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Verification request failed" },
      { status: 500 }
    );
  }
}
