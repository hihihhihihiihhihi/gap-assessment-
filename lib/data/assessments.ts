import { createClient } from "@/lib/supabase/server";
import {
  gapScore,
  isFightFlight,
  isLowAwareness,
  priorityOf,
  rankAreas,
  type AreaResult,
} from "@/lib/assessment/scoring";

/** Seeded demo assessment shown on the landing page (supabase/migrations/0001_init.sql). */
export const DEMO_ASSESSMENT_ID = "b0000000-0000-0000-0000-000000000001";

interface ScoreRow {
  life_area_id: string;
  current_score: number;
  desired_score: number;
  stress_level: number;
  awareness_level: number;
  life_areas: {
    name: string;
    description: string | null;
    sort_order: number;
  } | null;
}

export interface GapMapData {
  assessmentId: string;
  completedAt: string | null;
  areas: AreaResult[]; // ranked by priority, then gap desc
}

/** Load a completed assessment's scores and compute the ranked Gap Map. */
export async function getGapMap(
  assessmentId: string,
): Promise<GapMapData | null> {
  const supabase = await createClient();

  const { data: assessment, error: aErr } = await supabase
    .from("assessments")
    .select("id, status, completed_at")
    .eq("id", assessmentId)
    .maybeSingle();
  if (aErr) throw new Error(`Failed to load assessment: ${aErr.message}`);
  if (!assessment || assessment.status !== "completed") return null;

  const { data: rows, error: sErr } = await supabase
    .from("assessment_scores")
    .select(
      "life_area_id, current_score, desired_score, stress_level, awareness_level, life_areas(name, description, sort_order)",
    )
    .eq("assessment_id", assessmentId)
    .returns<ScoreRow[]>();
  if (sErr) throw new Error(`Failed to load scores: ${sErr.message}`);
  if (!rows || rows.length === 0) return null;

  const areas: AreaResult[] = rows.map((r) => ({
    life_area_id: r.life_area_id,
    life_area_name: r.life_areas?.name ?? "Unknown area",
    life_area_description: r.life_areas?.description ?? null,
    sort_order: r.life_areas?.sort_order ?? 0,
    current_score: r.current_score,
    desired_score: r.desired_score,
    stress_level: r.stress_level,
    awareness_level: r.awareness_level,
    gap_score: gapScore(r),
    fight_flight: isFightFlight(r),
    low_awareness: isLowAwareness(r),
    priority: priorityOf(r),
  }));

  return {
    assessmentId: assessment.id,
    completedAt: assessment.completed_at,
    areas: rankAreas(areas),
  };
}
