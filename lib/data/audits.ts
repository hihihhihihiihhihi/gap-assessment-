import { createAdminClient } from "@/lib/supabase/admin";

export interface Audit {
  id: string;
  session_token: string;
  status: "in_progress" | "completed";
  email: string | null;
  completed_at: string | null;
}

const AUDIT_FIELDS = "id, session_token, status, email, completed_at";

export async function createAudit(sessionToken: string): Promise<Audit> {
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("audits")
    .select(AUDIT_FIELDS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not load the audit: ${error.message}`);
  return (data as Audit) ?? null;
}

export async function markAuditCompleted(id: string): Promise<void> {
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("audits")
    .update({ email })
    .eq("id", id);
  if (error) throw new Error(`Could not save the email: ${error.message}`);
}
