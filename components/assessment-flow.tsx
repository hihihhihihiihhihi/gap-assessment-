"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { LifeArea } from "@/lib/data/life-areas";

export const LAST_ASSESSMENT_KEY = "gap-assessment:last-id";

const QUESTIONS = [
  {
    key: "current_score",
    min: 1,
    max: 10,
    label: "Where are you today?",
    help: "Rate your current satisfaction in this area.",
    lowLabel: "Struggling",
    highLabel: "Thriving",
  },
  {
    key: "desired_score",
    min: 1,
    max: 10,
    label: "Where do you want to be?",
    help: "Rate the level you desire for your epic life.",
    lowLabel: "Modest",
    highLabel: "Epic",
  },
  {
    key: "stress_level",
    min: 1,
    max: 5,
    label: "How much stress do you carry here?",
    help: "4 or above means you're likely running in fight-or-flight mode.",
    lowLabel: "Calm",
    highLabel: "Constant stress",
  },
  {
    key: "awareness_level",
    min: 1,
    max: 5,
    label: "How aware are you of your thoughts and behaviors here?",
    help: "2 or below suggests you're pushing through on autopilot.",
    lowLabel: "Autopilot",
    highLabel: "Fully aware",
  },
] as const;

type QuestionKey = (typeof QUESTIONS)[number]["key"];
type AreaAnswers = Partial<Record<QuestionKey, number>>;

export default function AssessmentFlow({ areas }: { areas: LifeArea[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AreaAnswers>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const area = areas[step];
  const areaAnswers = answers[area.id] ?? {};
  const areaComplete = QUESTIONS.every((q) => areaAnswers[q.key] !== undefined);
  const isLast = step === areas.length - 1;

  const completedCount = useMemo(
    () =>
      areas.filter((a) =>
        QUESTIONS.every((q) => (answers[a.id] ?? {})[q.key] !== undefined),
      ).length,
    [areas, answers],
  );

  function setAnswer(key: QuestionKey, value: number) {
    setAnswers((prev) => ({
      ...prev,
      [area.id]: { ...prev[area.id], [key]: value },
    }));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores: areas.map((a) => ({ life_area_id: a.id, ...answers[a.id] })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error ?? "Something went wrong saving your assessment.",
        );
      }
      try {
        localStorage.setItem(LAST_ASSESSMENT_KEY, data.id);
      } catch {
        // localStorage unavailable (private mode) — results still load by URL
      }
      router.push(`/results/${data.id}`);
    } catch (e) {
      setError(
        e instanceof Error && e.message !== "Failed to fetch"
          ? e.message
          : "We couldn't save your assessment — check your connection. Your answers are kept below.",
      );
      setSubmitting(false);
    }
  }

  function next() {
    if (!areaComplete) return;
    if (isLast) {
      void submit();
    } else {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0 });
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
          <span>
            Area {step + 1} of {areas.length}
          </span>
          <span>{completedCount} of {areas.length} completed</span>
        </div>
        <div className="flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={areas.length} aria-valuenow={completedCount} aria-label="Assessment progress">
          {areas.map((a, i) => {
            const done = QUESTIONS.every(
              (q) => (answers[a.id] ?? {})[q.key] !== undefined,
            );
            return (
              <div
                key={a.id}
                className={`h-1.5 flex-1 rounded-full ${
                  i === step
                    ? "bg-purple-600"
                    : done
                      ? "bg-purple-300"
                      : "bg-neutral-200"
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-900">{area.name}</h2>
        {area.description && (
          <p className="mt-1 text-sm text-neutral-500">{area.description}</p>
        )}

        <div className="mt-6 space-y-7">
          {QUESTIONS.map((q) => {
            const value = areaAnswers[q.key];
            const set = value !== undefined;
            return (
              <div key={q.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <label
                    htmlFor={`${area.id}-${q.key}`}
                    className="text-sm font-medium text-neutral-800"
                  >
                    {q.label}
                  </label>
                  <span
                    className={`min-w-10 rounded-md px-2 py-0.5 text-center text-sm font-semibold ${
                      set
                        ? "bg-purple-100 text-purple-800"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {set ? value : "—"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">{q.help}</p>
                <input
                  id={`${area.id}-${q.key}`}
                  type="range"
                  min={q.min}
                  max={q.max}
                  step={1}
                  value={value ?? Math.round((q.min + q.max) / 2)}
                  onChange={(e) => setAnswer(q.key, Number(e.target.value))}
                  onPointerDown={(e) =>
                    setAnswer(
                      q.key,
                      value ?? Number((e.target as HTMLInputElement).value),
                    )
                  }
                  className={`mt-3 w-full accent-purple-600 ${set ? "" : "opacity-60"}`}
                  aria-valuetext={set ? String(value) : "not set"}
                />
                <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                  <span>{q.lowLabel} ({q.min})</span>
                  <span>{q.highLabel} ({q.max})</span>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
            {error}
          </div>
        )}

        <div className="mt-7 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 disabled:invisible"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!areaComplete || submitting}
            className="rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {submitting
              ? "Saving…"
              : error
                ? "Retry"
                : isLast
                  ? "View My Gap Map"
                  : "Next →"}
          </button>
        </div>
        {!areaComplete && (
          <p className="mt-3 text-right text-xs text-neutral-400">
            Set all 4 sliders to continue
          </p>
        )}
      </div>
    </div>
  );
}
