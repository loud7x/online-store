"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function toKey(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

type State = "loading" | "unsupported" | "ready" | "denied" | "on";

export default function EnableNotifications() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      setState(sub && Notification.permission === "granted" ? "on" : "ready");
    })();
  }, []);

  async function enable() {
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setError("Please log in first.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "ready");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: toKey(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ) as BufferSource,
        }));

      const json = sub.toJSON();
      const { error: saveError } = await supabase
        .from("push_subscriptions")
        .upsert(
          {
            user_id: auth.user.id,
            endpoint: json.endpoint,
            p256dh: json.keys?.p256dh,
            auth: json.keys?.auth,
          },
          { onConflict: "endpoint" }
        );
      if (saveError) {
        setError(saveError.message);
        return;
      }
      setState("on");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not turn on notifications.");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading" || state === "on") return null;

  return (
    <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-white">
      {state === "unsupported" && (
        <p>
          To get message alerts on iPhone: tap Share, then Add to Home Screen,
          and open LoudVault from your home screen.
        </p>
      )}
      {state === "denied" && (
        <p>
          Notifications are blocked. Turn them on for this site in your browser
          settings.
        </p>
      )}
      {state === "ready" && (
        <div className="flex items-center justify-between gap-3">
          <p>Get notified when someone messages you, even when you're away.</p>
          <button
            type="button"
            onClick={enable}
            disabled={busy}
            className="btn btn-primary shrink-0 px-4 py-2 text-sm disabled:opacity-50"
          >
            {busy ? "Turning on…" : "Turn on"}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-red-400">{error}</p>}
    </div>
  );
}
