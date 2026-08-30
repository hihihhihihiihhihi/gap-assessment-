import { createClient } from "@/lib/supabase/server";
import type { AreaKey, Readings } from "@/lib/scoring/gap-calculator";

export interface AreaResponse extends Readings {
  area: AreaKey;
  gap_score: number;
  stress_flag: boolean;
  awareness_flag: boolean;
}

// gap_score / stress_flag / awareness_flag are generated columns — read only.
const RESPONSE_FIELDS =
  "area, now_score, want_score, stress_level, awareness_level, gap_score, stress_flag, awareness_flag";

export async function getAreaResponses(
  auditId: string,
): Promise<AreaResponse[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("area_responses")
    .select(RESPONSE_FIELDS)
    .eq("audit_id", auditId);
  if (error) throw new Error(`Could not load responses: ${error.message}`);
  return (data ?? []) as AreaResponse[];
}

/** One response per area per audit — re-answering an area overwrites it. */
export async function saveAreaResponse(
  auditId: string,
  area: AreaKey,
  readings: Readings,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("area_responses")
    .upsert(
      { audit_id: auditId, area, ...readings },
      { onConflict: "audit_id,area" },
    );
  if (error) throw new Error(`Could not save your answers: ${error.message}`);
}
