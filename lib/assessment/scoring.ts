// Rule-based scoring engine (docs/INTELLIGENCE_LAYER.md). Pure arithmetic — no AI.

export type Priority = "high" | "medium" | "low";

export interface AreaScoreInput {
  current_score: number;
  desired_score: number;
  stress_level: number;
  awareness_level: number;
}

export interface AreaResult extends AreaScoreInput {
  life_area_id: string;
  life_area_name: string;
  life_area_description: string | null;
  gap_score: number;
  fight_flight: boolean;
  low_awareness: boolean;
  priority: Priority;
}

export const FIGHT_FLIGHT_THRESHOLD = 4; // stress_level >= 4
export const LOW_AWARENESS_THRESHOLD = 2; // awareness_level <= 2

export function gapScore(s: AreaScoreInput): number {
  return s.desired_score - s.current_score;
}

export function isFightFlight(s: AreaScoreInput): boolean {
  return s.stress_level >= FIGHT_FLIGHT_THRESHOLD;
}

export function isLowAwareness(s: AreaScoreInput): boolean {
  return s.awareness_level <= LOW_AWARENESS_THRESHOLD;
}

export function priorityOf(s: AreaScoreInput): Priority {
  const ff = isFightFlight(s);
  const la = isLowAwareness(s);
  if (ff && la) return "high";
  if (ff || la) return "medium";
  return "low";
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** Sort by priority (high → low), then gap_score descending. */
export function rankAreas<T extends { priority: Priority; gap_score: number }>(
  areas: T[],
): T[] {
  return [...areas].sort(
    (a, b) =>
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      b.gap_score - a.gap_score,
  );
}

/** Average of all area gap scores, one decimal. */
export function overallGap(areas: { gap_score: number }[]): number {
  if (areas.length === 0) return 0;
  const sum = areas.reduce((acc, a) => acc + a.gap_score, 0);
  return Math.round((sum / areas.length) * 10) / 10;
}

export function inRange(n: unknown, min: number, max: number): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= min && n <= max;
}

/** Server-side range validation mirroring the DB check constraints. */
export function validateScores(s: {
  current_score?: unknown;
  desired_score?: unknown;
  stress_level?: unknown;
  awareness_level?: unknown;
}): s is AreaScoreInput {
  return (
    inRange(s.current_score, 1, 10) &&
    inRange(s.desired_score, 1, 10) &&
    inRange(s.stress_level, 1, 5) &&
    inRange(s.awareness_level, 1, 5)
  );
}
