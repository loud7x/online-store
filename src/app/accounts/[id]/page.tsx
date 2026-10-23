Here’s the full updated code — just copy everything below:
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaWhatsapp, FaPhone } from "react-icons/fa";
import { createClient } from "@/lib/supabase/client";

type Listing = {
  id: string;
  user_id: string;
  title: string;
  price: number;
  images: string[] | null;
  account_video_url: string | null;
  account_status: string | null;
  status_notes: string | null;
  account_details: string | null;
  whatsapp_number: string | null;
  status: "active" | "pending" | "sold" | "archived" | null;
  created_at: string;
};

type Seller = {
  id: string;
  username: string | null;
  is_verified: boolean | null;
  rating: number | null;
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AccountDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [listing, setListing] = useState
(null);
  const [seller, setSeller] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function getMediaUrl(path: string | null) {
      try {
        if (!path?.trim()) return null;

        const value = path.trim();
        if (value.startsWith("https://") || value.startsWith("http://")) {
          return value;
        }

        const cleanPath = value
          .replace(/^\/+/, "")
          .replace(/^account-media\//, "");

        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from("account-media")
          .createSignedUrl(cleanPath, 3600);

        if (error) return null;
        return data?.signedUrl ?? null;
      } catch {
        return null;
      }
    }

    async function loadAccount(accountId: string) {
      try {
        setLoading(true);
        setError("");

        const supabase = createClient();

        const { data: authData } = await supabase.auth.getUser();
        if (!cancelled) {
          setUserId(authData.user?.id ?? null);
        }

        const { data: listingData, error: listingError } = await supabase
          .from("listings")
          .select(
            "id, user_id, title, price, images, account_video_url, account_status, status_notes, account_details, whatsapp_number, status, created_at"
          )
          .eq("id", accountId)
          .maybeSingle();

        if (cancelled) return;

        if (listingError) {
          setError(listingError.message);
          return;
        }

        if (!listingData) {
          setError("This account listing could not be found.");
          return;
        }

        const account = listingData as Listing;
        setListing(account);

        const { data: sellerData } = await supabase
          .from("users")
          .select("id, username, is_verified, rating")
          .eq("id", account.user_id)
          .maybeSingle();

        if (cancelled) return;
        setSeller((sellerData as Seller | null) ?? null);

        const firstImage = account.images?.[0] ?? null;

        const [resolvedImage, resolvedVideo] = await Promise.all([
          getMediaUrl(firstImage),
          getMediaUrl(account.account_video_url),
        ]);

        if (cancelled) return;

        setImageUrl(resolvedImage);
        setVideoUrl(resolvedVideo);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) {
      void loadAccount(id);
    } else {
      setError("No account selected.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function copySellerNumber(number: string) {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Could not copy the number. Please copy it manually.");
    }
  }

  if (loading) {
    return (
      
        
          Loading account...
        
      
    );
  }

  if (!listing) {
    return (
      
        
          
{error || "Account not found."}
          
            Browse Accounts
          
        
      
    );
  }

  const status = listing.status ?? "active";
  const isOwner = !!userId && userId === listing.user_id;
  const isSold = status === "sold";
  const isArchived = status === "archived";
  const isPending = status === "pending";
  const isAvailable = status === "active";
  const sellerName = seller?.username || "Seller";

  const whatsappDigits = (listing.whatsapp_number || "").replace(/\D/g, "");

  const whatsappMessage = `Hi, I'm interested in your eFootball account "${listing.title}" listed on LOUDEFOOT for ${formatNaira(
    Number(listing.price || 0)
  )}. Is it still available?`;

  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const callUrl = whatsappDigits ? `tel:+${whatsappDigits}` : null;

  return (
    
      
        ← Back to accounts
      

      {error && (
        
          {error}
        
      )}

      
        {/* Left Column - Media */}
        
          
            {imageUrl ? (
              
            ) : (
              
                Account picture unavailable
              
            )}

            {/* Status Badges */}
            {isSold && (
              
                SOLD · UNAVAILABLE
              
            )}
            {isArchived && (
              
                ARCHIVED
              
            )}
            {isPending && (
              
                PENDING
              
            )}
          

          {videoUrl && (
            
          )}
        

        {/* Right Column - Details */}
        
          
            eFootball · {listing.account_status || "Account"}
          

          
            {listing.title}
          

          
            {formatNaira(Number(listing.price || 0))}
          

          {/* Status note */}
          {listing.status_notes && (
            
              {listing.status_notes}
            
          )}

          {/* Account details */}
          {listing.account_details && (
            
              
                Account Details
              
              
                {listing.account_details}
              
            
          )}

          {/* Seller info */}
          
            
              {sellerName.charAt(0).toUpperCase()}
            
            
              
                {sellerName}
                {seller?.is_verified && (
                  
                    Verified
                  
                )}
              
              {seller?.rating != null && (
                
                  Rating: {seller.rating.toFixed(1)}
                
              )}
            
          

          {/* Action buttons */}
          
            {isAvailable && whatsappUrl && (
              
                
                Chat on WhatsApp
              
            )}

            {isAvailable && callUrl && (
              
                
                Phone Vendor
              
            )}

            {isAvailable && listing.whatsapp_number && (
               copySellerNumber(listing.whatsapp_number!)}
                className="btn btn-ghost flex w-full items-center justify-center gap-2 px-5 py-3 text-sm"
              >
                {copied ? "Number copied!" : "Copy WhatsApp Number"}
              
            )}

            {isOwner && (
              
                Edit Listing
              
            )}

            {(isSold || isArchived) && (
              
                This account is no longer available.
              
            )}
          
        
      
    
  );
}
