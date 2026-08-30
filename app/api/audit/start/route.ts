import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { createAudit, getAuditBySession } from "@/lib/data/audits";
import { getAreaResponses } from "@/lib/data/area-responses";
import { readSessionToken, writeSessionToken } from "@/lib/session";
import { AREAS } from "@/lib/scoring/gap-calculator";

export const dynamic = "force-dynamic";

/**
 * Entry point for "Start the Audit".
 * Resumes an in-progress audit at the first unanswered area; otherwise
 * creates a fresh one. `?fresh=1` always starts over.
 */
export async function GET(request: NextRequest) {
  const fresh = request.nextUrl.searchParams.get("fresh") === "1";
  const home = new URL("/", request.url);

  try {
    if (!fresh) {
      const token = await readSessionToken();
      if (token) {
        const audit = await getAuditBySession(token);
        if (audit && audit.status === "in_progress") {
          const answered = new Set(
            (await getAreaResponses(audit.id)).map((r) => r.area),
          );
          const next = AREAS.find((a) => !answered.has(a.key)) ?? AREAS[0];
          return NextResponse.redirect(new URL(`/audit/${next.key}`, request.url));
        }
      }
    }

    const token = randomUUID();
    await createAudit(token);
    await writeSessionToken(token);
    return NextResponse.redirect(new URL(`/audit/${AREAS[0].key}`, request.url));
  } catch {
    // Surface the failure on the landing page rather than a blank screen.
    home.searchParams.set("error", "start");
    return NextResponse.redirect(home);
  }
}
