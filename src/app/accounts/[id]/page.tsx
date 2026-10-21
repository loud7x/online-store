'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { startOrGetConversation } from '@/lib/chat';

export default function AccountDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      const { data, error } = await supabase
        .from('listings')
        .select('*, users:seller_id(id, full_name, username, avatar_url, whatsapp_number)')
        .eq('id', params.id)
        .single();

      if (!error && data) {
        setListing(data);
      }
      setLoading(false);
    }

    fetchListing();
  }, [params.id]);

  const handleChatSeller = async () => {
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      if (user.id === listing.seller_id) {
        alert('This is your own listing!');
        return;
      }

      const convId = await startOrGetConversation(
        user.id,
        listing.seller_id,
        listing.id
      );
      router.push(`/messages?conversation=${convId}`);
    } catch (err: any) {
      alert(err.message || 'Error starting chat');
    } finally {
      setActionLoading(false);
    }
  };

  // Format WhatsApp Link with pre-filled message
  const getWhatsAppLink = () => {
    const rawNumber = listing?.whatsapp_number || listing?.users?.whatsapp_number;
    if (!rawNumber) return null;

    const cleanNumber = rawNumber.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hello! I am interested in your eFootball listing: "${listing.title}" (₦${listing.price.toLocaleString()}). Is it still available?`
    );

    return `https://wa.me/${cleanNumber}?text=${text}`;
  };

  const whatsappLink = getWhatsAppLink();

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading details...</div>;
  }

  if (!listing) {
    return <div className="text-center py-20 text-red-400">Listing not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Media & Specs */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
            {listing.image_url ? (
              <img
                src={listing.image_url}
                alt={listing.title}
                className="w-full h-auto object-cover max-h-[480px]"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No Screenshot Uploaded
              </div>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
            <p className="text-gray-300 whitespace-pre-line">
              {listing.description || 'No description provided.'}
            </p>

            {listing.featured_players?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  Featured Players
                </h3>
                <div className="flex flex-wrap gap-2">
                  {listing.featured_players.map((player: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-gray-800 text-blue-400 text-xs px-3 py-1.5 rounded-full border border-gray-700"
                    >
                      {player}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Contact Options */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
            <div>
              <span className="text-sm text-gray-400">Asking Price</span>
              <div className="text-3xl font-bold text-green-400">
                ₦{listing.price.toLocaleString()}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-800 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Squad Rating:</span>
                <span className="text-white font-medium">
                  {listing.squad_rating || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Manager:</span>
                <span className="text-white font-medium">
                  {listing.manager || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">eFootball Coins:</span>
                <span className="text-yellow-400 font-medium">
                  🪙 {listing.coins || 0}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button
                onClick={() => router.push(`/checkout?listing=${listing.id}`)}
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
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
