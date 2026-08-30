import type { NextRequest } from "next/server";
import { getAuditBySession, saveAuditEmail } from "@/lib/data/audits";
import { readSessionToken } from "@/lib/session";
import { validEmail } from "@/lib/scoring/gap-calculator";
import { fail, ok } from "@/lib/api-result";

export const dynamic = "force-dynamic";

// POST /api/audit/email — attach her email to the audit record.
export async function POST(request: NextRequest) {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail("Malformed request body.", { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!validEmail(email)) {
    return fail("That doesn't look like an email address.", { status: 400 });
  }

  const token = await readSessionToken();
  if (!token) {
    return fail("Your session has expired — start the audit again.", {
      status: 401,
    });
  }

  try {
    const audit = await getAuditBySession(token);
    if (!audit) {
      return fail("Your session has expired — start the audit again.", {
        status: 401,
      });
    }
    // PII: stored only on audits.email, never written to application logs.
    await saveAuditEmail(audit.id, email);
    return ok({ saved: true });
  } catch {
    return fail("We couldn't save your email just now.", {
      status: 503,
      retryable: true,
    });
  }
}
