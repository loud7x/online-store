
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { startOrGetConversation } from '@/lib/chat';

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchListing() {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Listing fetch error:', error.message);
          if (!cancelled) setListing(null);
          return;
        }

        if (!data) {
          if (!cancelled) setListing(null);
          return;
        }

        if (cancelled) return;
        setListing(data);

        // Load seller information separately.
        if (data.seller_id) {
          const { data: sellerData, error: sellerError } =
            await supabase
              .from('users')
              .select('id, username, is_verified, rating')
              .eq('id', data.seller_id)
              .maybeSingle();

          if (sellerError) {
            console.error('Seller fetch error:', sellerError.message);
          }

          if (!cancelled) setSeller(sellerData);
        }

        // Support image URLs and images stored in Supabase Storage.
        const storedImage =
          (Array.isArray(data.images) ? data.images[0] : null) ||
          data.account_image_url ||
          data.image_url ||
          null;

        if (typeof storedImage === 'string' && storedImage.trim()) {
          const value = storedImage.trim();
          let resolvedUrl: string | null = value;

          if (
            !value.startsWith('https://') &&
            !value.startsWith('http://')
          ) {
            const path = value
              .replace(/^\/+/, '')
              .replace(/^account-media\//, '');

            const { data: signedData, error: imageError } =
              await supabase.storage
                .from('account-media')
                .createSignedUrl(path, 3600);

            if (imageError) {
              console.error('Listing image error:', imageError.message);
              resolvedUrl = null;
            } else {
              resolvedUrl = signedData?.signedUrl ?? null;
            }
          }

          if (!cancelled) setImageUrl(resolvedUrl);
        }
      } catch (error) {
        console.error('Unexpected listing error:', error);
        if (!cancelled) setListing(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) fetchListing();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChatSeller = async () => {
    if (!listing) return;

    setActionLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      if (user.id === listing.seller_id) {
        alert('This is your own listing!');
        return;
      }

      const conversationId = await startOrGetConversation(
        user.id,
        listing.seller_id,
        listing.id
      );

      router.push(`/messages?conversation=${conversationId}`);
    } catch (error: any) {
      alert(error.message || 'Error starting chat');
    } finally {
      setActionLoading(false);
    }
  };

  const getWhatsAppLink = () => {
    if (!listing?.whatsapp_number) return null;

    const number = String(listing.whatsapp_number).replace(/\D/g, '');
    if (!number) return null;

    const message = encodeURIComponent(
      `Hello! I am interested in your eFootball listing: "${listing.title}" (₦${Number(listing.price).toLocaleString()}). Is it still available?`
    );

    return `https://wa.me/${number}?text=${message}`;
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        Loading details...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20 text-red-400">
        Listing not found. Please check the listing link or try again.
        <div>
          <button
            onClick={() => router.push('/accounts')}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            Browse Accounts
          </button>
        </div>
      </div>
    );
  }

  const whatsappLink = getWhatsAppLink();
  const sold = listing.status === 'sold';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={listing.title || 'eFootball account'}
                className="w-full h-auto object-cover max-h-[480px]"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No Screenshot Uploaded
              </div>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-white">
                {listing.title}
              </h1>

              {sold && (
                <span className="rounded-full bg-red-900 px-3 py-1 text-sm font-semibold text-red-200">
                  SOLD
                </span>
              )}
            </div>

            <p className="text-gray-300 whitespace-pre-line">
              {listing.description || 'No description provided.'}
            </p>

            {listing.featured_players?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  Featured Players
                </h3>
                <div className="flex flex-wrap gap-2">
                  {listing.featured_players.map(
                    (player: string, index: number) => (
                      <span
                        key={index}
                        className="bg-gray-800 text-blue-400 text-xs px-3 py-1.5 rounded-full border border-gray-700"
                      >
                        {player}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
            <div>
              <span className="text-sm text-gray-400">Asking Price</span>
              <div className="text-3xl font-bold text-green-400">
                ₦{Number(listing.price || 0).toLocaleString()}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-800 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-400">Team Strength:</span>
                <span className="text-white font-medium">
                  {listing.team_strength || listing.squad_rating || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-400">OVR:</span>
                <span className="text-white font-medium">
                  {listing.ovr || listing.overall_rating || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-400">Platform:</span>
                <span className="text-white font-medium">
                  {listing.platform || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-400">eFootball Coins:</span>
                <span className="text-yellow-400 font-medium">
                  🪙 {Number(listing.coins || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-400">Seller:</span>
                <span className="text-white font-medium">
                  {seller?.username || 'Seller'}
                  {seller?.is_verified ? ' ✓' : ''}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              {sold ? (
                <button
                  disabled
                  className="w-full py-3 bg-gray-700 text-gray-300 font-semibold rounded-lg cursor-not-allowed"
                >
                  Account Sold
                </button>
              ) : (
                <>
                  <button
                    onClick={() =>
                      router.push(`/checkout?listing=${listing.id}`)
                    }
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Buy Now
                  </button>

                  {whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      Chat on WhatsApp
                    </a>
                  )}

                  <button
                    onClick={handleChatSeller}
                    disabled={actionLoading}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors border border-gray-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Connecting...' : 'In-App Chat'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
