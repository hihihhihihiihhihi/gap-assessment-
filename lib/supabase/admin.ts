import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key.
 *
 * Every read and write in this app happens on the server (route handlers and
 * server components), so the browser never needs database access. That lets the
 * public RLS policies be dropped entirely — see
 * supabase/migrations/0002_lock_down_reads.sql — which keeps visitor emails
 * unreadable from the client, while anonymous visitors still work with no login.
 *
 * The service-role key bypasses RLS. It must never reach a client component;
 * the "server-only" import above turns that into a build error.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
