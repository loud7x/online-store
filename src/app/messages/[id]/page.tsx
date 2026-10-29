"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Conversation = { id: string; listing_id: string; buyer_id: string; seller_id: string; created_at: string };
type Message = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string };
function formatTime(value: string) { return new Date(value).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [userId, setUserId] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [title, setTitle] = useState("Account listing");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setError("Please log in to view private messages."); setLoading(false); return; }
    setUserId(auth.user.id);
    const { data: conv, error: convError } = await supabase.from("conversations")
      .select("id,listing_id,buyer_id,seller_id,created_at").eq("id", id).maybeSingle();
    if (convError || !conv) { setError("Conversation not found or you do not have access to it."); setLoading(false); return; }
    setConversation(conv as Conversation);
    const { data: listing } = await supabase.from("listings").select("title").eq("id", conv.listing_id).maybeSingle();
    if (listing?.title) setTitle(listing.title);
    const { data: messageRows, error: messageError } = await supabase.from("messages")
      .select("id,conversation_id,sender_id,body,created_at").eq("conversation_id", id).order("created_at", { ascending: true });
    if (messageError) setError(messageError.message);
    else setMessages((messageRows ?? []) as Message[]);
    await supabase.from("messages").update({ is_read: true }).eq("conversation_id", id).neq("sender_id", auth.user.id).eq("is_read", false);
    setLoading(false);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = text.trim();
    if (!body || sending || !conversation) return;
    setSending(true); setError("");
    const supabase = createClient();
    const { data, error: insertError } = await supabase.from("messages")
      .insert({ conversation_id: conversation.id, sender_id: userId, body, is_read: false })
      .select("id,conversation_id,sender_id,body,created_at").single();
    if (insertError) setError(insertError.message);
    else { setMessages((previous) => [...previous, data as Message]); setText(""); }
    setSending(false);
  }

  useEffect(() => {
    if (!conversation) return;
    const supabase = createClient();
    const channel = supabase.channel(`messages-${id}`).on("postgres_changes", {
      event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}`,
    }, (payload) => {
      const incoming = payload.new as Message;
      if (incoming.sender_id !== userId) void supabase.from("messages").update({ is_read: true }).eq("id", incoming.id);
      setMessages((previous) => previous.some((message) => message.id === incoming.id) ? previous : [...previous, incoming]);
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [conversation, id, userId]);

  return <main className="container-main section-padding"><div className="mx-auto flex max-w-3xl flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]" style={{ minHeight: "65vh", maxHeight: "850px" }}>
    <header className="border-b border-[var(--border)] p-4"><Link href="/messages" className="text-sm text-[var(--primary)]">← All messages</Link><h1 className="mt-2 font-semibold text-white">{conversation ? (conversation.buyer_id === userId ? "Vendor" : "Buyer") : "Private chat"}</h1><p className="mt-1 truncate text-xs text-[var(--muted)]">{title}</p></header>
    {loading ? <div className="p-8 text-center text-[var(--muted)]">Loading conversation…</div> : error && !conversation ? <div className="p-6 text-sm text-white">{error}{error.includes("log in") && <Link href="/login" className="ml-2 text-[var(--primary)] underline">Log in</Link>}</div> : <>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.length === 0 && <p className="py-8 text-center text-sm text-[var(--muted)]">No messages yet. Say hello to start the conversation.</p>}{messages.map((message) => { const mine = message.sender_id === userId; return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${mine ? "rounded-br-md bg-[var(--primary)] text-white" : "rounded-bl-md border border-[var(--border)] bg-[var(--card)] text-white"}`}><p className="whitespace-pre-wrap break-words text-sm">{message.body}</p><p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-[var(--muted)]"}`}>{formatTime(message.created_at)}</p></div></div>; })}</div>
      {error && <p className="px-4 text-sm text-red-400">{error}</p>}
      <form onSubmit={sendMessage} className="flex gap-2 border-t border-[var(--border)] p-3"><input value={text} onChange={(event) => setText(event.target.value)} maxLength={5000} placeholder="Type a private message…" className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--primary)]"/><button type="submit" disabled={!text.trim() || sending} className="btn btn-primary px-5 py-2.5 text-sm disabled:opacity-50">{sending ? "Sending…" : "Send"}</button></form>
    </>}
  </div><p className="mx-auto mt-3 max-w-3xl text-xs text-[var(--muted)]">Never share passwords, recovery codes, or payment details in chat. Always pay through LoudVault checkout.</p></main>;
}
