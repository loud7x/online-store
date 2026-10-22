'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const PAYMENT_OPTIONS = [
  { id: 'card', name: 'Debit / Credit Card', note: 'Visa, Mastercard, Verve' },
  { id: 'bank_transfer', name: 'Bank Transfer', note: 'Pay from your banking app' },
  { id: 'opay', name: 'OPay', note: 'OPay wallet or transfer' },
  { id: 'palmpay', name: 'PalmPay', note: 'PalmPay app or transfer' },
  { id: 'ussd', name: 'USSD Code', note: 'Supported Nigerian banks' },
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing');
  const router = useRouter();
  // Create the client once, so it doesn't change on every render
  const supabase = useMemo(() => createClient(), []);

  const [listing, setListing] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [method, setMethod] = useState('card');
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
        .maybeSingle();

      if (error || !data) {
        setError('Listing not found.');
        setLoading(false);
        return;
      }

      if (data.status !== 'active') {
        setError('This account is no longer available.');
        setLoading(false);
        return;
      }

      setListing(data);

      const stored =
        (Array.isArray(data.images) ? data.images[0] : null) ||
        data.account_image_url ||
        data.image_url ||
        null;

      if (typeof stored === 'string' && stored.trim()) {
        const value = stored.trim();

        if (value.startsWith('https://') || value.startsWith('http://')) {
          setImageUrl(value);
        } else {
          const path = value
            .replace(/^\/+/, '')
            .replace(/^account-media\//, '');

          const { data: signed } = await supabase.storage
            .from('account-media')
            .createSignedUrl(path, 3600);

          setImageUrl(signed?.signedUrl ?? null);
        }
      }

      setLoading(false);
    }

    fetchListing();
  }, [listingId, router, supabase]);

  const handlePaystackPayment = async () => {
    setPaying(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPaying(false);
        router.push('/login');
        return;
      }

      if (listing.seller_id === user.id) {
        throw new Error('You cannot buy your own listing.');
      }

      // The server looks up the real price itself, so no amount is sent.
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          email: user.email,
          method,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to initialize payment');
      }

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

  if (!listing) {
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

  const price = Number(listing.price || 0);

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Secure Checkout</h1>
      <p className="text-gray-400 mb-8">Complete your payment securely via Paystack.</p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        <div className="flex gap-4 items-center pb-6 border-b border-gray-800">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-24 h-24 object-cover rounded-lg border border-gray-700"
            />
          )}
          <div>
            <h2 className="font-semibold text-lg text-white">{listing.title}</h2>
            <p className="text-sm text-gray-400 mt-1">
              Team strength: {listing.team_strength || listing.squad_rating || 'N/A'} • Coins:{' '}
              {Number(listing.coins || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-white mb-3">Payment method</p>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                  method === option.id
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value={option.id}
                  checked={method === option.id}
                  onChange={() => setMethod(option.id)}
                />
                <span>
                  <span className="block text-sm text-white">{option.name}</span>
                  <span className="block text-xs text-gray-400">{option.note}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Account Price</span>
            <span>₦{price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Buyer Protection</span>
            <span className="text-green-400">Included</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-gray-800">
            <span>Total Amount</span>
            <span className="text-green-400">₦{price.toLocaleString()}</span>
          </div>
        </div>

        {error && (
          <p className="break-words rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={handlePaystackPayment}
          disabled={paying}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {paying ? 'Redirecting to Paystack...' : `Pay ₦${price.toLocaleString()} with Paystack`}
        </button>

        <p className="text-xs text-center text-gray-500">
          🔒 Payments are processed by Paystack. LOUDEFOOT holds your money until you confirm you received the account.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Preparing checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
