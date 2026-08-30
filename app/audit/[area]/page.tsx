import { redirect } from "next/navigation";
import AreaForm from "@/components/audit/area-form";
import { getAuditBySession } from "@/lib/data/audits";
import { getAreaResponses } from "@/lib/data/area-responses";
import { readSessionToken } from "@/lib/session";
import { AREAS, isAreaKey } from "@/lib/scoring/gap-calculator";

export const dynamic = "force-dynamic";

export default async function AuditAreaPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area } = await params;
  if (!isAreaKey(area)) redirect("/");

  // No audit in this session yet → start one (route handler sets the cookie).
  const token = await readSessionToken();
  if (!token) redirect(`/api/audit/start`);

  const audit = await getAuditBySession(token);
  if (!audit) redirect(`/api/audit/start?fresh=1`);

  const index = AREAS.findIndex((a) => a.key === area);
  const meta = AREAS[index];

  // Resume: prefill anything she already answered for this area.
  const existing = (await getAreaResponses(audit.id)).find(
    (r) => r.area === area,
  );

  return (
    <AreaForm
      area={meta.key}
      label={meta.label}
      prompt={meta.prompt}
      stepIndex={index}
      totalSteps={AREAS.length}
      initial={
        existing
          ? {
              now_score: Number(existing.now_score),
              want_score: Number(existing.want_score),
              stress_level: Number(existing.stress_level),
              awareness_level: Number(existing.awareness_level),
            }
          : null
      }
      isLast={index === AREAS.length - 1}
      prevArea={index > 0 ? AREAS[index - 1].key : null}
      nextArea={index < AREAS.length - 1 ? AREAS[index + 1].key : null}
    />
  );
}
