import { NextResponse } from 'next/server';
import { verifyPaystackPayment } from '@/lib/payments/methods';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Missing transaction reference.' },
        { status: 400 }
      );
    }

    // Verify transaction status with Paystack API
    const verification = await verifyPaystackPayment(reference);

    if (!verification || verification.status !== 'success') {
      return NextResponse.json(
        { error: 'Transaction was not successful.' },
        { status: 400 }
      );
    }

    const listingId = verification.metadata?.listing_id;

    // Mark the listing as sold only if the payment was for a listing
    if (listingId) {
      const supabase = await createClient();
      const { error: updateError } = await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', listingId);

      if (updateError) {
        console.error('Failed to mark listing as sold:', updateError);
        return NextResponse.json(
          { error: 'Payment succeeded but listing could not be updated.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      amount: verification.amount,
      reference: verification.reference,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Server error verifying payment.';
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
