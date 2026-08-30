import type { NextRequest } from "next/server";
import { getAuditBySession } from "@/lib/data/audits";
import { saveAreaResponse } from "@/lib/data/area-responses";
import { readSessionToken } from "@/lib/session";
import { isAreaKey, validReadings } from "@/lib/scoring/gap-calculator";
import { fail, ok } from "@/lib/api-result";

export const dynamic = "force-dynamic";

// POST /api/audit/response — save one area's four readings.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("Malformed request body.", { status: 400 });
  }

  const area = body.area;
  if (typeof area !== "string" || !isAreaKey(area)) {
    return fail("Unknown life area.", { status: 400 });
  }

  const readings = {
    now_score: body.now_score,
    want_score: body.want_score,
    stress_level: body.stress_level,
    awareness_level: body.awareness_level,
  } as Record<string, unknown>;

  if (!validReadings(readings)) {
    return fail("Every reading must be a number between 1 and 10.", {
      status: 400,
    });
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
    await saveAreaResponse(audit.id, area, readings);
    return ok({ area });
  } catch {
    // Network/DB blip — the client keeps the slider values and offers Retry.
    return fail("We couldn't save that just now.", {
      status: 503,
      retryable: true,
    });
  }
}
