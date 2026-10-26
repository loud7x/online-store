Here’s the updated file with “Unverified seller” → “Unverified vendor”:
"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { MdVerified } from "react-icons/md";
import { AccountListing, formatNaira } from "@/data/mock";

interface AccountCardProps {
  account: AccountListing & {
    imageUrl?: string | null;
    seller_id?: string | null;
    game?: string | null;
  };
}

export default function AccountCard({ account }: AccountCardProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const imageUrl = account.imageUrl;
  const sellerId = account.seller_id;
  const sellerName = account.seller?.username || "Seller";
  const gameName = account.game || "eFootball";
  const isEfootball = gameName.toLowerCase() === "efootball";
  const showOvr = isEfootball && (account.overallRating ?? 0) > 0;

  const sellerInfo = (
    <>
      
        {sellerName.slice(0, 2).toUpperCase()}
      
      
        {sellerName}
      
    
  );

  return (
    
      

      {/* Account Image (tap to enlarge) */}
      
 setViewerOpen(true) : undefined}
      >
        {imageUrl ? (
          <>
            
            
          
        ) : (
          
            
              {isEfootball && account.teamStrength
                ? account.teamStrength
                : gameName}
            
            
              {isEfootball && account.teamStrength
                ? "Team Strength"
                : "Account"}
            
          
        )}
        {account.isFeatured && (
          
            Featured
          
        )}
        {account.isBestValue && (
          
            Best Value
          
        )}
        
          {gameName}
        
      

      {/* Full-screen image viewer */}
      {viewerOpen &&
        imageUrl &&
        createPortal(
          
 setViewerOpen(false)}
          >
             setViewerOpen(false)}
            >
              ×
            
             e.stopPropagation()}
            />
          
,
          document.body
        )}

      {/* Account Details */}
      
        
          
            {account.title}
          
          
            {formatNaira(account.price)}
          
        

        
          {account.platform && (
            
              {account.platform}
            
          )}
          {showOvr && (
            
              OVR {account.overallRating}
            
          )}
          {isEfootball && (account.epicPlayers ?? 0) > 0 && (
            
              {account.epicPlayers} Epic
            
          )}
        

        {/* Verification Badge */}
        {account.seller?.verified ? (
          
             Verified Vendor
          
        ) : (
          
            Unverified vendor
          
        )}

        {/* Seller Information */}
        
          {sellerId ? (
            
              {sellerInfo}
            
          ) : (
            
              {sellerInfo}
            
          )}
        
      
    
  );
}
