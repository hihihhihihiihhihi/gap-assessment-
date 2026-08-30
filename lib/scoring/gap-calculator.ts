// Rule-based Gap Map scoring (docs/INTELLIGENCE_LAYER.md). Pure arithmetic — no AI.

export const AREA_KEYS = [
  "career",
  "health",
  "relationships",
  "finances",
  "growth",
  "purpose",
] as const;

export type AreaKey = (typeof AREA_KEYS)[number];

export interface AreaMeta {
  key: AreaKey;
  label: string;
  prompt: string;
}

/** Wizard order, fixed: career → health → relationships → finances → growth → purpose. */
export const AREAS: AreaMeta[] = [
  {
    key: "career",
    label: "Career",
    prompt: "The work you do and what it asks of you.",
  },
  {
    key: "health",
    label: "Health",
    prompt: "Your body, your energy, the sleep you actually get.",
  },
  {
    key: "relationships",
    label: "Relationships",
    prompt: "The people closest to you, and how present you are with them.",
  },
  {
    key: "finances",
    label: "Finances",
    prompt: "Money, security, and how much of it you carry alone.",
  },
  {
    key: "growth",
    label: "Growth",
    prompt: "Learning, becoming, the parts of you still unfinished.",
  },
  {
    key: "purpose",
    label: "Purpose",
    prompt: "Meaning — why any of this matters to you.",
  },
];

export const AREA_LABELS: Record<AreaKey, string> = Object.fromEntries(
  AREAS.map((a) => [a.key, a.label]),
) as Record<AreaKey, string>;

export function areaMeta(key: AreaKey): AreaMeta {
  const found = AREAS.find((a) => a.key === key);
  if (!found) throw new Error(`Unknown life area: ${key}`);
  return found;
}

export function isAreaKey(value: string): value is AreaKey {
  return (AREA_KEYS as readonly string[]).includes(value);
}

export const STRESS_FLAG_THRESHOLD = 7; // stress >= 7 → fight/flight zone
export const AWARENESS_FLAG_THRESHOLD = 4; // awareness <= 4 → low-awareness zone

export interface Readings {
  now_score: number;
  want_score: number;
  stress_level: number;
  awareness_level: number;
}

export interface RankedArea {
  area: AreaKey;
  gap: number;
  stress_flag: boolean;
  awareness_flag: boolean;
  now: number;
  want: number;
  stress: number;
  awareness: number;
}

export interface GapMapResult {
  ranked_areas: RankedArea[];
  total_gap: number;
  zones: {
    fight_or_flight: AreaKey[];
    low_awareness: AreaKey[];
    widest_gap: AreaKey | null;
  };
}

export function gapScore(r: Readings): number {
  return r.want_score - r.now_score;
}

export function stressFlag(r: Readings): boolean {
  return r.stress_level >= STRESS_FLAG_THRESHOLD;
}

export function awarenessFlag(r: Readings): boolean {
  return r.awareness_level <= AWARENESS_FLAG_THRESHOLD;
}

/**
 * Build the Gap Map from raw area responses: rank by gap descending,
 * overlay the fight/flight and low-awareness zones, sum the total gap.
 * Ties break on the fixed wizard order so output is deterministic.
 */
export function buildGapMap(
  responses: (Readings & { area: AreaKey })[],
): GapMapResult {
  const order = new Map(AREA_KEYS.map((k, i) => [k, i]));

  const ranked: RankedArea[] = responses
    .map((r) => ({
      area: r.area,
      gap: gapScore(r),
      stress_flag: stressFlag(r),
      awareness_flag: awarenessFlag(r),
      now: r.now_score,
      want: r.want_score,
      stress: r.stress_level,
      awareness: r.awareness_level,
    }))
    .sort(
      (a, b) =>
        b.gap - a.gap ||
        (order.get(a.area) ?? 0) - (order.get(b.area) ?? 0),
    );

  return {
    ranked_areas: ranked,
    total_gap: ranked.reduce((sum, a) => sum + a.gap, 0),
    zones: {
      fight_or_flight: ranked.filter((a) => a.stress_flag).map((a) => a.area),
      low_awareness: ranked.filter((a) => a.awareness_flag).map((a) => a.area),
      widest_gap: ranked.length > 0 ? ranked[0].area : null,
    },
  };
}

/** Mirrors the DB check constraints: every reading is 1–10. */
export function validReading(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 1 && n <= 10;
}

export function validReadings(r: Partial<Readings>): r is Readings {
  return (
    validReading(r.now_score) &&
    validReading(r.want_score) &&
    validReading(r.stress_level) &&
    validReading(r.awareness_level)
  );
}

/** RFC-lite email check — good enough to reject typos, not a deliverability claim. */
export function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
