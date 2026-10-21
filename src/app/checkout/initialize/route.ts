import { NextResponse } from 'next/server';
import { initializePayment } from '@/lib/payments/paystack';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listingId, amount, email } = body;

    if (!listingId || !amount || !email) {
      return NextResponse.json(
        { error: 'Missing required parameters (listingId, amount, email).' },
        { status: 400 }
      );
    }

    // Initialize payment with Paystack helper
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/verify`;
    const paystackData = await initializePayment({
      email,
      amountInNgn: amount,
      callbackUrl,
      metadata: {
        listing_id: listingId,
      },
    });

    return NextResponse.json({
      authorization_url: paystackData.authorization_url,
      access_code: paystackData.access_code,
      reference: paystackData.reference,
    });
  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize transaction.' },
      { status: 500 }
    );
  }
}
