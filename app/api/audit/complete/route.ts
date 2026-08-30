import { getAuditBySession, markAuditCompleted } from "@/lib/data/audits";
import { getAreaResponses } from "@/lib/data/area-responses";
import { saveGapMap } from "@/lib/data/gap-maps";
import { readSessionToken } from "@/lib/session";
import { AREA_KEYS, buildGapMap } from "@/lib/scoring/gap-calculator";
import { fail, ok } from "@/lib/api-result";

export const dynamic = "force-dynamic";

// POST /api/audit/complete — compute the Gap Map server-side and store it.
export async function POST() {
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

    const responses = await getAreaResponses(audit.id);
    if (responses.length < AREA_KEYS.length) {
      const answered = new Set(responses.map((r) => r.area));
      const missing = AREA_KEYS.filter((k) => !answered.has(k));
      return fail(`Still to answer: ${missing.join(", ")}.`, { status: 400 });
    }

    const result = buildGapMap(responses);
    await saveGapMap(audit.id, result);
    await markAuditCompleted(audit.id);

    return ok({ total_gap: result.total_gap });
  } catch {
    return fail("We couldn't build your Gap Map just now.", {
      status: 503,
      retryable: true,
    });
  }
}
