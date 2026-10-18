import Link from "next/link";
import { conversations, formatMsgTime } from "@/data/messages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your conversations with buyers and sellers on LOUDEFOOT.",
};

export default function MessagesPage() {
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="container-main section-padding">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">Messages</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {totalUnread > 0
            ? `${totalUnread} unread message${totalUnread !== 1 ? "s" : ""}`
            : "All caught up"}
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden divide-y divide-[var(--border)]">
        {conversations.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted)]">
            No conversations yet. Message a seller from a listing to get started.
          </div>
        ) : (
          conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="flex items-start gap-4 p-4 hover:bg-[var(--card-hover)] transition-colors"
            >
              <div className="h-11 w-11 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-medium text-white shrink-0">
                {conv.otherUser.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`font-medium truncate ${conv.unreadCount ? "text-white" : "text-[var(--muted)]"}`}>
                      {conv.otherUser.username}
                    </span>
                    {conv.otherUser.verified && (
                      <span className="text-[var(--primary)] text-xs">✓</span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] shrink-0">
                    {formatMsgTime(conv.lastMessageAt)}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                  {conv.listingTitle || conv.exchangeTitle}
                </p>
                <p className={`text-sm mt-1 truncate ${conv.unreadCount ? "text-white font-medium" : "text-[var(--muted)]"}`}>
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="h-5 min-w-5 px-1.5 rounded-full bg-[var(--primary)] text-white text-xs font-medium flex items-center justify-center shrink-0">
                  {conv.unreadCount}
                </span>
              )}
            </Link>
          ))
        )}
      </div>

      <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
        Demo conversations. Private emails are never exposed. Report or block available in each thread.
      </p>
    </div>
  );
}
