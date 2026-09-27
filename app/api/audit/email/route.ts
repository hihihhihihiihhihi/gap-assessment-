import type { NextRequest } from "next/server";
import {
  getAuditBySession,
  markResultsSent,
  saveAuditEmail,
} from "@/lib/data/audits";
import { getGapMapByAudit } from "@/lib/data/gap-maps";
import { readSessionToken } from "@/lib/session";
import { validEmail } from "@/lib/scoring/gap-calculator";
import { sendEmail } from "@/lib/email/send";
import {
  resultsHtml,
  resultsSubject,
  resultsText,
} from "@/lib/email/results-email";
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

    // Send her Gap Map automatically. Delivery problems must not lose the
    // address she just gave us, so a failure here is reported, not thrown.
    const gapMap = await getGapMapByAudit(audit.id);
    if (!gapMap) {
      return ok({ saved: true, emailed: false });
    }

    const payload = {
      areas: gapMap.ranked_areas,
      totalGap: Number(gapMap.total_gap),
    };
    const result = await sendEmail({
      to: email,
      subject: resultsSubject(payload.areas),
      html: resultsHtml({
        ...payload,
        resultsUrl: process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/results`
          : undefined,
      }),
      text: resultsText(payload),
    });

    if (result.status === "sent") {
      await markResultsSent(audit.id);
      return ok({ saved: true, emailed: true });
    }

    console.warn(`[email] results not sent (${result.status}): ${result.reason}`);
    return ok({ saved: true, emailed: false });
  } catch {
    return fail("We couldn't save your email just now.", {
      status: 503,
      retryable: true,
    });
  }
}
