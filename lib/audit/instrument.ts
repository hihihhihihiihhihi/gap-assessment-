/**
 * The Gap Audit instrument, copied verbatim from the published page
 * (lib/audit/gap-audit.html). Statements, scale wording and band thresholds
 * must stay byte-identical to what she wrote. Do not reword them here.
 */

export interface Section {
  key: "s1" | "s2" | "s3";
  label: string;
  /** Column on audits that stores this section's subtotal. */
  column: "section_mask" | "section_current" | "section_gap";
  questions: string[];
}

export const SECTIONS: Section[] = [
  {
    key: "s1",
    label: "The Mask",
    column: "section_mask",
    questions: [
      "I can't remember the last time I took a real break without feeling guilty.",
      "When someone asks how I am, I say 'fine' automatically — before I've actually checked.",
      "I measure my worth by my output. A good day is a productive day.",
      "If I'm honest, I would struggle to describe who I am outside of my role.",
    ],
  },
  {
    key: "s2",
    label: "The Current",
    column: "section_current",
    questions: [
      "I carry a low, constant sense of dread I can't quite name.",
      "I can't slow down — even when I want to — without feeling like something will catch me.",
      "I've been tired for so long that I've stopped noticing it. It's just my baseline.",
      "Rest feels like falling behind.",
    ],
  },
  {
    key: "s3",
    label: "The Gap",
    column: "section_gap",
    questions: [
      "There's a difficult experience I've never fully processed. I just outworked it.",
      "Anger, impatience, or shutting down are the only emotions I really let out. I don't have words for the rest.",
      "I'm successful — and I feel further from myself than I've ever been.",
      "I'm afraid of what I'd find if I actually stopped.",
    ],
  },
];

export const SCALE = [
  { n: 1, w: "Never" },
  { n: 2, w: "Rarely" },
  { n: 3, w: "Sometimes" },
  { n: 4, w: "Often" },
  { n: 5, w: "Almost always" },
] as const;

export const QUESTION_COUNT = 12;
export const MAX_SCORE = 60;

/** Bands exactly as published. */
export function bandFor(total: number): string {
  if (total <= 24) return "Clear Water (12–24)";
  if (total <= 36) return "Strong Current (25–36)";
  if (total <= 48) return "Running on Empty (37–48)";
  return "Against the Current (49–60)";
}

/** Short name without the range, for use in a subject line or sentence. */
export function bandName(total: number): string {
  return bandFor(total).replace(/\s*\(.*\)$/, "");
}

export interface Scored {
  total: number;
  sections: { label: string; key: Section["key"]; score: number }[];
  band: string;
}

/** answers is keyed by question number, 1 to 12, in published order. */
export function score(answers: Record<number, number>): Scored {
  const sections = SECTIONS.map((section, si) => {
    let sum = 0;
    for (let qi = 0; qi < section.questions.length; qi++) {
      sum += answers[si * 4 + qi + 1] ?? 0;
    }
    return { label: section.label, key: section.key, score: sum };
  });

  const total = sections.reduce((acc, s) => acc + s.score, 0);
  return { total, sections, band: bandFor(total) };
}

export function validAnswers(
  answers: Record<number, number>,
): boolean {
  for (let q = 1; q <= QUESTION_COUNT; q++) {
    const v = answers[q];
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 5) {
      return false;
    }
  }
  return true;
}

/** The statement text for a question number, for the email breakdown. */
export function questionText(n: number): string {
  const si = Math.floor((n - 1) / 4);
  const qi = (n - 1) % 4;
  return SECTIONS[si]?.questions[qi] ?? "";
}
