"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Conversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
};
type Message = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string };
type Listing = { id: string; title: string; listing_status?: string };

function formatTime(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" }) + " " + date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

export default function MessagesPage() {
  const router = useRouter();
  const [listingId, setListingId] = useState<string | null>(null);
  useEffect(() => { setListingId(new URLSearchParams(window.location.search).get("listingId")); }, []);
  const [items, setItems] = useState<Array<{ conversation: Conversation; title: string; lastMessage: string; lastAt: string; otherLabel: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      setError("Please log in to use private messages.");
      setLoading(false);
      return;
    }
    const uid = auth.user.id;

    if (listingId) {
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("id,user_id,title,listing_status")
        .eq("id", listingId)
        .maybeSingle();
      if (listingError || !listing) {
        setError("This listing could not be found."); setLoading(false); return;
      }
      if (listing.user_id === uid) {
        setError("You cannot message yourself about your own listing."); setLoading(false); return;
      }
      if (listing.listing_status === "sold") {
        setError("This account has been sold and is no longer available."); setLoading(false); return;
      }
      const { data: existing, error: findError } = await supabase
        .from("conversations").select("id")
        .eq("listing_id", listingId).eq("buyer_id", uid).maybeSingle();
      if (findError) { setError(findError.message); setLoading(false); return; }
      let conversationId = existing?.id;
      if (!conversationId) {
        const { data: created, error: createError } = await supabase
          .from("conversations")
          .insert({ listing_id: listingId, buyer_id: uid, seller_id: listing.user_id })
          .select("id").single();
        if (createError) { setError(`Could not start conversation: ${createError.message}`); setLoading(false); return; }
        conversationId = created.id;
      }
      router.replace(`/messages/${conversationId}`);
      return;
    }

    const { data: conversations, error: conversationError } = await supabase
      .from("conversations").select("id,listing_id,buyer_id,seller_id,created_at")
      .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`).order("created_at", { ascending: false });
    if (conversationError) { setError(conversationError.message); setLoading(false); return; }
    const rows = conversations ?? [];
    if (!rows.length) { setItems([]); setLoading(false); return; }
    const listingIds = [...new Set(rows.map((c) => c.listing_id))];
    const convIds = rows.map((c) => c.id);
    const [{ data: listings }, { data: messages }] = await Promise.all([
      supabase.from("listings").select("id,title,listing_status").in("id", listingIds),
      supabase.from("messages").select("id,conversation_id,sender_id,body,created_at").in("conversation_id", convIds).order("created_at", { ascending: false }),
    ]);
    const listingMap = new Map((listings ?? []).map((l: Listing) => [l.id, l]));
    const lastByConversation = new Map<string, Message>();
    for (const message of messages ?? []) if (!lastByConversation.has(message.conversation_id)) lastByConversation.set(message.conversation_id, message as Message);
    setItems(rows.map((conversation) => {
      const last = lastByConversation.get(conversation.id);
      return {
        conversation,
        title: listingMap.get(conversation.listing_id)?.title ?? "Account listing",
        lastMessage: last?.body ?? "No messages yet — say hello.",
        lastAt: last?.created_at ?? conversation.created_at,
        otherLabel: conversation.buyer_id === uid ? "Seller" : "Buyer",
      };
    }));
    setLoading(false);
  }, [listingId, router]);

  useEffect(() => { void load(); }, [load]);

  return <main className="container-main section-padding">
    <div className="mb-8"><h1 className="text-2xl sm:text-3xl font-semibold text-white">Messages</h1><p className="mt-1 text-sm text-[var(--muted)]">Private conversations about LOUDEFOOT listings.</p></div>
    {loading ? <div className="rounded-xl border border-[var(--border)] p-8 text-center text-[var(--muted)]">Loading your messages…</div> : error ? <div className="rounded-xl border border-red-500/40 p-5 text-sm text-white"><p>{error}</p>{error.includes("log in") && <Link className="mt-3 inline-block text-[var(--primary)] underline" href="/login">Log in</Link>}</div> : items.length === 0 ? <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-10 text-center"><p className="text-white">No conversations yet.</p><p className="mt-2 text-sm text-[var(--muted)]">Open an account listing and choose DM Seller to start a private chat.</p><Link href="/accounts" className="btn btn-primary mt-5 inline-flex px-5 py-2.5 text-sm">Browse accounts</Link></div> : <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
      {items.map((item) => <Link key={item.conversation.id} href={`/messages/${item.conversation.id}`} className="block p-4 transition-colors hover:bg-[var(--card-hover)]"><div className="flex items-center justify-between gap-3"><span className="font-medium text-white">{item.otherLabel}</span><span className="text-xs text-[var(--muted-foreground)]">{formatTime(item.lastAt)}</span></div><p className="mt-1 truncate text-xs text-[var(--primary)]">{item.title}</p><p className="mt-1 truncate text-sm text-[var(--muted)]">{item.lastMessage}</p></Link>)}
    </div>}
  </main>;
}
