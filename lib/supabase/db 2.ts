import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * The server-side database client for every read and write in this app.
 *
 * Nothing in the browser talks to Supabase, so this is the only path to the
 * database. It prefers the service-role key, which bypasses RLS and keeps
 * visitor emails unreadable from the client once the public policies are
 * dropped (supabase/migrations/0002_lock_down_reads.sql).
 *
 * If that key is not configured it falls back to the anon key, which still
 * works while the permissive v1 policies are in place. The fallback exists so
 * the audit keeps working end to end with no login in any configuration,
 * rather than the whole app failing on a missing environment variable.
 */

let warned = false;

export function createDbClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  }

  const key = serviceKey ?? anonKey;
  if (!key) {
    throw new Error(
      "No Supabase key configured: set SUPABASE_SERVICE_ROLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (!serviceKey && !warned) {
    warned = true;
    console.warn(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY not set, falling back to the anon key. " +
        "Visitor emails stay readable by anyone holding that public key until it is configured.",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
