import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateScores } from "@/lib/assessment/scoring";

interface SubmittedScore {
  life_area_id: string;
  current_score: number;
  desired_score: number;
  stress_level: number;
  awareness_level: number;
}

// POST /api/assessments — create a completed assessment with its 6 area scores.
export async function POST(request: Request) {
  let body: { scores?: SubmittedScore[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const scores = body.scores;
  if (!Array.isArray(scores) || scores.length === 0) {
    return NextResponse.json(
      { error: "Missing scores." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // Validate against the canonical life areas: one score per area, all areas covered.
  const { data: areas, error: areasErr } = await supabase
    .from("life_areas")
    .select("id");
  if (areasErr || !areas || areas.length === 0) {
    return NextResponse.json(
      { error: "Could not load life areas. Please try again." },
      { status: 500 },
    );
  }
  const areaIds = new Set(areas.map((a) => a.id));
  const submittedIds = new Set(scores.map((s) => s.life_area_id));
  if (
    submittedIds.size !== scores.length ||
    scores.length !== areaIds.size ||
    ![...submittedIds].every((id) => areaIds.has(id))
  ) {
    return NextResponse.json(
      { error: "Scores must cover each life area exactly once." },
      { status: 400 },
    );
  }

  // Range validation mirroring the DB check constraints (1–10 / 1–5).
  for (const s of scores) {
    if (!validateScores(s)) {
      return NextResponse.json(
        {
          error:
            "Scores out of range: current/desired must be 1–10, stress/awareness 1–5.",
        },
        { status: 400 },
      );
    }
  }

  const now = new Date().toISOString();
  const { data: assessment, error: aErr } = await supabase
    .from("assessments")
    .insert({ status: "completed", started_at: now, completed_at: now })
    .select("id")
    .single();
  if (aErr || !assessment) {
    return NextResponse.json(
      { error: "Could not save your assessment. Please try again." },
      { status: 500 },
    );
  }

  const { error: sErr } = await supabase.from("assessment_scores").insert(
    scores.map((s) => ({
      assessment_id: assessment.id,
      life_area_id: s.life_area_id,
      current_score: s.current_score,
      desired_score: s.desired_score,
      stress_level: s.stress_level,
      awareness_level: s.awareness_level,
    })),
  );
  if (sErr) {
    // Roll back the orphaned assessment so retries start clean.
    await supabase.from("assessments").delete().eq("id", assessment.id);
    return NextResponse.json(
      { error: "Could not save your scores. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: assessment.id }, { status: 201 });
}
