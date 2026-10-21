import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/payments/paystack';
import { createServerClient } from '@/lib/supabase/server';

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
    const verification = await verifyPayment(reference);

    if (verification.status !== 'success') {
      return NextResponse.json(
        { error: 'Transaction was not successful.' },
        { status: 400 }
      );
    }

    const listingId = verification.metadata?.listing_id;
    const supabase = createServerClient();

    // Update listing status to sold if applicable
    if (listingId) {
      await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', listingId);
    }

    return NextResponse.json({
      success: true,
      amount: verification.amount,
      reference: verification.reference,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error verifying payment.' },
      { status: 500 }
    );
  }
}
