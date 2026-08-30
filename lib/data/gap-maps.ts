import { createAdminClient } from "@/lib/supabase/admin";
import type { GapMapResult, RankedArea } from "@/lib/scoring/gap-calculator";

export interface GapMapRow {
  id: string;
  audit_id: string;
  ranked_areas: RankedArea[];
  total_gap: number;
  ai_summary: string | null;
}

const GAP_MAP_FIELDS = "id, audit_id, ranked_areas, total_gap, ai_summary";

export async function saveGapMap(
  auditId: string,
  result: GapMapResult,
): Promise<GapMapRow> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("gap_maps")
    .upsert(
      {
        audit_id: auditId,
        ranked_areas: result.ranked_areas,
        total_gap: result.total_gap,
      },
      { onConflict: "audit_id" },
    )
    .select(GAP_MAP_FIELDS)
    .single();
  if (error || !data) {
    throw new Error(`Could not save the Gap Map: ${error?.message ?? "no row"}`);
  }
  return data as GapMapRow;
}

export async function getGapMapByAudit(
  auditId: string,
): Promise<GapMapRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("gap_maps")
    .select(GAP_MAP_FIELDS)
    .eq("audit_id", auditId)
    .maybeSingle();
  if (error) throw new Error(`Could not load the Gap Map: ${error.message}`);
  return (data as GapMapRow) ?? null;
}
