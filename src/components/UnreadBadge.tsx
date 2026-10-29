"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UnreadBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let me = "";
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function refresh() {
      if (!me) return;
      const { count: c } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false)
        .neq("sender_id", me);
      if (!cancelled) setCount(c ?? 0);
    }

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user || cancelled) return;
      me = data.user.id;
      await refresh();
      channel = supabase
        .channel("unread-badge")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          () => {
            void refresh();
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  if (count <= 0) return null;

  return (
    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
