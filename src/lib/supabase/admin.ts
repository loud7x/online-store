import { createClient } from "@supabase/supabase-js";

// Server-only. Never import this file in a "use client" component.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase service role key is missing from environment variables."
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
