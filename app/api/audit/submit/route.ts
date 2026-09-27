import type { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { createDbClient } from "@/lib/supabase/db";
import {
  QUESTION_COUNT,
  SECTIONS,
  score,
  validAnswers,
} from "@/lib/audit/instrument";
import { validEmail } from "@/lib/scoring/gap-calculator";
import { sendEmail } from "@/lib/email/send";
import {
  auditResultsHtml,
  auditResultsText,
  auditSubject,
} from "@/lib/email/audit-results-email";
import { fail, ok } from "@/lib/api-result";

export const dynamic = "force-dynamic";

/**
 * The Gap Audit submission endpoint.
 *
 * The published page (lib/audit/gap-audit.html) posts here instead of
 * Formspree. It stores the submission, then emails her result to her
 * automatically. Delivery problems are reported, never thrown: an address
 * that reached us must not be lost because email is misconfigured.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("Malformed request body.", { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!validEmail(email)) {
    return fail("That doesn't look like an email address.", { status: 400 });
  }

  // Two accepted shapes. Preferred: answers as { "1": 4, ... }. Also accepted:
  // the published page's own payload, which sends "Q1: 4 · Q2: 5 · ..." in
  // allAnswers, so that page can post here without editing its JavaScript.
  const answers: Record<number, number> = {};
  const raw = body.answers;
  if (typeof raw === "object" && raw !== null) {
    for (let q = 1; q <= QUESTION_COUNT; q++) {
      const v = (raw as Record<string, unknown>)[String(q)];
      if (typeof v === "number") answers[q] = v;
    }
  } else if (typeof body.allAnswers === "string") {
    for (const m of body.allAnswers.matchAll(/Q(\d{1,2})\s*:\s*(\d)/g)) {
      answers[Number(m[1])] = Number(m[2]);
    }
  } else {
    return fail("Missing answers.", { status: 400 });
  }

  if (!validAnswers(answers)) {
    return fail("Every statement needs an answer between 1 and 5.", {
      status: 400,
    });
  }

  const firstName =
    typeof body.firstName === "string" && body.firstName.trim() !== "—"
      ? body.firstName.trim().slice(0, 120)
      : null;
  const consent = body.consent === true || body.consent === "Yes";

  const scored = score(answers);
  const supabase = createDbClient();

  let auditId: string;
  try {
    const sectionColumns = Object.fromEntries(
      SECTIONS.map((s) => [
        s.column,
        scored.sections.find((x) => x.key === s.key)?.score ?? 0,
      ]),
    );

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("audits")
      .insert({
        session_token: randomUUID(),
        status: "completed",
        email,
        first_name: firstName,
        consent,
        total_score: scored.total,
        band: scored.band,
        ...sectionColumns,
        completed_at: now,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "no row returned");
    auditId = data.id;

    const { error: answersError } = await supabase.from("audit_answers").insert(
      Object.keys(answers)
        .map(Number)
        .map((n) => ({
          audit_id: auditId,
          question_number: n,
          value: answers[n],
        })),
    );
    if (answersError) throw new Error(answersError.message);
  } catch (error) {
    // Never log the address: it is PII (docs/SECURITY.md).
    console.error(
      "[audit] could not store submission:",
      error instanceof Error ? error.message : "unknown",
    );
    return fail("We couldn't save your answers just now. Please try again.", {
      status: 503,
      retryable: true,
    });
  }

  const ctaUrl = process.env.CTA_URL || undefined;
  const payload = { scored, answers, firstName, ctaUrl };

  const result = await sendEmail({
    to: email,
    subject: auditSubject(scored),
    html: auditResultsHtml(payload),
    text: auditResultsText(payload),
  });

  if (result.status === "sent") {
    const { error } = await supabase
      .from("audits")
      .update({ results_sent_at: new Date().toISOString() })
      .eq("id", auditId);
    if (error) {
      console.error("[audit] could not stamp results_sent_at:", error.message);
    }
    return ok({ stored: true, emailed: true });
  }

  console.warn(`[email] result not sent (${result.status}): ${result.reason}`);
  return ok({ stored: true, emailed: false });
}
