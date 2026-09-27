import { createDbClient } from "@/lib/supabase/db";

export interface Audit {
  id: string;
  session_token: string;
  status: "in_progress" | "completed";
  email: string | null;
  completed_at: string | null;
  /** Present only once supabase/migrations/0003_results_sent.sql is applied. */
  results_sent_at?: string | null;
}

// results_sent_at is deliberately not selected: PostgREST rejects the whole
// query with a 400 if the column does not exist yet, which would take down
// every page until 0003 is applied.
const AUDIT_FIELDS = "id, session_token, status, email, completed_at";

export async function createAudit(sessionToken: string): Promise<Audit> {
  const supabase = createDbClient();
  const { data, error } = await supabase
    .from("audits")
    .insert({ session_token: sessionToken })
    .select(AUDIT_FIELDS)
    .single();
  if (error || !data) {
    throw new Error(`Could not start the audit: ${error?.message ?? "no row"}`);
  }
  return data as Audit;
}

/** Most recent audit for this visitor's session — the one the wizard resumes. */
export async function getAuditBySession(
  sessionToken: string,
): Promise<Audit | null> {
  const supabase = createDbClient();
  const { data, error } = await supabase
    .from("audits")
    .select(AUDIT_FIELDS)
    .eq("session_token", sessionToken)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Could not load the audit: ${error.message}`);
  return (data as Audit) ?? null;
}

export async function getAuditById(id: string): Promise<Audit | null> {
  const supabase = createDbClient();
  const { data, error } = await supabase
    .from("audits")
    .select(AUDIT_FIELDS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not load the audit: ${error.message}`);
  return (data as Audit) ?? null;
}

export async function markAuditCompleted(id: string): Promise<void> {
  const supabase = createDbClient();
  const { error } = await supabase
    .from("audits")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Could not complete the audit: ${error.message}`);
}

export async function saveAuditEmail(
  id: string,
  email: string,
): Promise<void> {
  const supabase = createDbClient();
  const { error } = await supabase
    .from("audits")
    .update({ email })
    .eq("id", id);
  if (error) throw new Error(`Could not save the email: ${error.message}`);
}

/** Stamped once the results email is accepted by the provider. */
export async function markResultsSent(id: string): Promise<void> {
  const supabase = createDbClient();
  const { error } = await supabase
    .from("audits")
    .update({ results_sent_at: new Date().toISOString() })
    .eq("id", id);
  // A failed stamp must not fail the request: she already has her email.
  if (error) {
    console.error("[audits] could not stamp results_sent_at:", error.message);
  }
}
