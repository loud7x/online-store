"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { use, useState } from "react";
import { conversations, messagesByConv, formatMsgTime } from "@/data/messages";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const conv = conversations.find((c) => c.id === id);
  const initialMessages = messagesByConv[id] || [];
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");

  if (!conv) {
    return (
      <div className="container-main section-padding text-center">
        <p className="text-[var(--muted)]">Conversation not found.</p>
        <Link href="/messages" className="btn btn-primary mt-4 px-5 py-2.5 text-sm inline-flex">
          Back to Messages
        </Link>
      </div>
    );
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const newMsg = {
      id: `m-${Date.now()}`,
      conversationId: id,
      senderId: "me",
      senderName: "You",
      body: text.trim(),
      createdAt: new Date().toISOString(),
      isRead: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setText("");
  }

  return (
    <div className="container-main flex flex-col" style={{ height: "calc(100vh - 8rem)", maxHeight: "800px" }}>
      {/* Header */}
      <div className="flex items-center gap-3 py-4 border-b border-[var(--border)] shrink-0">
        <Link href="/messages" className="text-[var(--muted)] hover:text-white p-1">
          ←
        </Link>
        <div className="h-10 w-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-medium text-white">
          {conv.otherUser.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-white">{conv.otherUser.username}</span>
            {conv.otherUser.verified && <span className="text-[var(--primary)] text-xs">✓</span>}
          </div>
          <p className="text-xs text-[var(--muted)] truncate">
            {conv.listingTitle || conv.exchangeTitle}
          </p>
        </div>
        <button type="button" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--danger)]">
          Report
        </button>
      </div>

      {/* Linked listing banner */}
      {(conv.listingId || conv.exchangeId) && (
        <div className="py-2 px-1 border-b border-[var(--border)] shrink-0">
          <Link
            href={conv.listingId ? `/accounts/${conv.listingId}` : `/exchange/${conv.exchangeId}`}
            className="text-xs text-[var(--primary)] hover:underline"
          >
            View {conv.listingId ? "listing" : "exchange offer"} →
          </Link>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === "me";
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  isMe
                    ? "bg-[var(--primary)] text-white rounded-br-md"
                    : "bg-[var(--card)] border border-[var(--border)] text-white rounded-bl-md"
                }`}
              >
                {msg.isOffer && (
                  <div className={`text-xs mb-1.5 font-medium ${isMe ? "text-white/80" : "text-[var(--primary)]"}`}>
                    Exchange offer · {msg.offerStatus || "pending"}
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-[var(--muted-foreground)]"}`}>
                  {formatMsgTime(msg.createdAt)}
                </p>
                {msg.isOffer && msg.offerStatus === "pending" && !isMe && (
                  <div className="flex gap-2 mt-2">
                    <button type="button" className="btn btn-primary btn-sm text-xs px-3 py-1">
                      Accept
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm text-xs px-3 py-1">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <form onSubmit={sendMessage} className="flex gap-2 py-4 border-t border-[var(--border)] shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
