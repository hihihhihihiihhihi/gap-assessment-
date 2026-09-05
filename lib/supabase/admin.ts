/**
 * Deprecated. The database client now lives in lib/supabase/db.ts, which
 * prefers the service-role key and falls back to the anon key so the audit
 * keeps working when the service-role key is not configured.
 *
 * This file is a re-export only, kept so nothing breaks if an older import
 * path is still around. Safe to delete.
 */
export { createDbClient as createAdminClient } from "@/lib/supabase/db";
