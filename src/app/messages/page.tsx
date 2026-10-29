"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Row = {
  id: string;
  title: string;
  otherName: string;
  otherRole: "Buyer" | "Vendor";
  lastBody: string;
  lastAt: string;
  unread: number;
};

function formatTime(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    const me = auth.user?.id;
    if (!me) {
      setLoggedIn(false);
      setLoading(false);
      return;
    }

    const { data: convs, error: convError } = await supabase
      .from("conversations")
      .select("id,listing_id,buyer_id,seller_id,created_at")
      .or(`buyer_id.eq.${me},seller_id.eq.${me}`)
      .order("created_at", { ascending: false });

    if (convError) {
      setError(convError.message);
      setLoading(false);
      return;
    }

    const list = convs ?? [];
    if (list.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    const convIds = list.map((c) => c.id);
    const listingIds = Array.from(new Set(list.map((c) => c.listing_id)));
    const otherIds = Array.from(
      new Set(list.map((c) => (c.buyer_id === me ? c.seller_id : c.buyer_id)))
    );

    const [listingsRes, usersRes, msgsRes] = await Promise.all([
      supabase.from("listings").select("id,title").in("id", listingIds),
      supabase.from("users").select("id,username").in("id", otherIds),
      supabase
        .from("messages")
        .select("conversation_id,sender_id,body,is_read,created_at")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);

    const titles = new Map<string, string>();
    (listingsRes.data ?? []).forEach((l) => titles.set(l.id, l.title));

    const names = new Map<string, string>();
    (usersRes.data ?? []).forEach((u) => names.set(u.id, u.username ?? ""));

    const last = new Map<string, { body: string; at: string }>();
    const unread = new Map<string, number>();
    (msgsRes.data ?? []).forEach((m) => {
      if (!last.has(m.conversation_id)) {
        last.set(m.conversation_id, { body: m.body ?? "", at: m.created_at });
      }
      if (m.sender_id !== me && m.is_read === false) {
        unread.set(m.conversation_id, (unread.get(m.conversation_id) ?? 0) + 1);
      }
    });

    const built: Row[] = list.map((c) => {
      const iAmBuyer = c.buyer_id === me;
      const otherId = iAmBuyer ? c.seller_id : c.buyer_id;
      const lm = last.get(c.id);
      return {
        id: c.id,
        title: titles.get(c.listing_id) ?? "Account listing",
        otherName: names.get(otherId) || (iAmBuyer ? "Vendor" : "Buyer"),
        otherRole: iAmBuyer ? "Vendor" : "Buyer",
        lastBody: lm?.body ?? "No messages yet",
        lastAt: lm?.at ?? c.created_at,
        unread: unread.get(c.id) ?? 0,
      };
    });

    built.sort((a, b) => +new Date(b.lastAt) - +new Date(a.lastAt));
    setRows(built);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Live updates: new messages and read-status changes
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("inbox-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          void load();
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  return (
    <main className="container-main section-padding">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-xl font-bold text-white">Messages</h1>

        {loading ? (
          <p className="py-10 text-center text-[var(--muted)]">Loading…</p>
        ) : !loggedIn ? (
          <p className="py-10 text-center text-white">
            Please log in to see your messages.
            <Link href="/login" className="ml-2 text-[var(--primary)] underline">
              Log in
            </Link>
          </p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] p-8 text-center">
            <p className="text-white">No conversations yet.</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Open an account and tap Contact Vendor to start chatting.
            </p>
            <Link
              href="/accounts"
              className="btn btn-primary mt-4 inline-block px-5 py-2 text-sm"
            >
              Browse Accounts
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            {rows.map((r) => (
              <Link
                key={r.id}
                href={`/messages/${r.id}`}
                className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--card)] p-4 last:border-b-0 hover:bg-white/5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-white">
                  {r.otherName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-sm text-white ${
                        r.unread > 0 ? "font-bold" : "font-semibold"
                      }`}
                    >
                      {r.otherName}{" "}
                      <span className="text-xs font-normal text-[var(--muted)]">
                        · {r.otherRole}
                      </span>
                    </p>
                    <span className="shrink-0 text-[10px] text-[var(--muted)]">
                      {formatTime(r.lastAt)}
                    </span>
                  </div>

                  <p className="truncate text-xs text-[var(--primary)]">{r.title}</p>

                  <p
                    className={`truncate text-sm ${
                      r.unread > 0 ? "text-white" : "text-[var(--muted)]"
                    }`}
                  >
                    {r.lastBody}
                  </p>
                </div>

                {r.unread > 0 && (
                  <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                    {r.unread > 99 ? "99+" : r.unread}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
