'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing');
  const router = useRouter();
  const supabase = createBrowserClient();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) {
      router.push('/accounts');
      return;
    }

    async function fetchListing() {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (error || !data) {
        setError('Listing not found or no longer active.');
      } else {
        setListing(data);
      }
      setLoading(false);
    }

    fetchListing();
  }, [listingId, router, supabase]);

  const handlePaystackPayment = async () => {
    setPaying(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Call backend API route to initialize Paystack transaction
      const response = await fetch('/api/checkout/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          amount: listing.price,
          email: user.email,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to initialize payment');
      }

      // Redirect user to Paystack checkout URL
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        throw new Error('Invalid payment gateway response');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Preparing checkout...</div>;
  }

  if (error || !listing) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <p className="text-red-400 mb-4">{error || 'Something went wrong.'}</p>
        <button
          onClick={() => router.push('/accounts')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Secure Checkout</h1>
      <p className="text-gray-400 mb-8">Complete your payment securely via Paystack.</p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        <div className="flex gap-4 items-center pb-6 border-b border-gray-800">
          {listing.image_url && (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-24 h-24 object-cover rounded-lg border border-gray-700"
            />
          )}
          <div>
            <h2 className="font-semibold text-lg text-white">{listing.title}</h2>
            <p className="text-sm text-gray-400 mt-1">
              Rating: {listing.squad_rating || 'N/A'} • Coins: {listing.coins || 0}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Account Price</span>
            <span>₦{listing.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Escrow & Protection Fee</span>
            <span className="text-green-400">FREE</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-gray-800">
            <span>Total Amount</span>
            <span className="text-green-400">₦{listing.price.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={handlePaystackPayment}
          disabled={paying}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {paying ? 'Redirecting to Paystack...' : `Pay ₦${listing.price.toLocaleString()} with Paystack`}
        </button>

        <p className="text-xs text-center text-gray-500">
          🔒 Payments are securely processed via Paystack. Account details are released to you upon verification.
        </p>
      </div>
    </div>
  );
}
