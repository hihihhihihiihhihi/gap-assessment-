"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AreaKey, Readings } from "@/lib/scoring/gap-calculator";

const READINGS = [
  {
    key: "now_score",
    label: "Where you are now",
    help: "The current — honestly, not the version you'd say out loud.",
    low: "Nowhere near",
    high: "Exactly where I want",
  },
  {
    key: "want_score",
    label: "Where you want to be",
    help: "The life you'd choose if nothing were in the way.",
    low: "Modest",
    high: "All of it",
  },
  {
    key: "stress_level",
    label: "How much of this runs on fight/flight",
    help: "7 or above means this area is running on survival.",
    low: "Calm",
    high: "Constant",
  },
  {
    key: "awareness_level",
    label: "How aware you are of what you feel here",
    help: "4 or below means it's mostly happening on autopilot.",
    low: "Autopilot",
    high: "Fully aware",
  },
] as const;

type ReadingKey = (typeof READINGS)[number]["key"];

export default function AreaForm({
  area,
  label,
  prompt,
  stepIndex,
  totalSteps,
  initial,
  isLast,
  prevArea,
  nextArea,
}: {
  area: AreaKey;
  label: string;
  prompt: string;
  stepIndex: number;
  totalSteps: number;
  initial: Readings | null;
  isLast: boolean;
  prevArea: AreaKey | null;
  nextArea: AreaKey | null;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Partial<Record<ReadingKey, number>>>(
    initial ?? {},
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = READINGS.every((r) => values[r.key] !== undefined);

  async function submit() {
    if (!complete || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/audit/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, ...values }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.reason ?? "We couldn't save that.");

      if (isLast) {
        const done = await fetch("/api/audit/complete", { method: "POST" });
        const doneData = await done.json().catch(() => ({}));
        if (!done.ok) {
          throw new Error(doneData.reason ?? "We couldn't build your Gap Map.");
        }
        router.push("/results");
      } else if (nextArea) {
        router.push(`/audit/${nextArea}`);
      }
    } catch (e) {
      // Values stay in state — nothing is lost, Retry re-sends them.
      setError(
        e instanceof Error && e.message !== "Failed to fetch"
          ? e.message
          : "We couldn't reach the server. Your answers are still here.",
      );
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
          <span>
            Area {stepIndex + 1} of {totalSteps}
          </span>
          <span>{label}</span>
        </div>
        <div
          className="flex gap-1.5"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={stepIndex + 1}
          aria-label="Audit progress"
        >
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i === stepIndex
                  ? "bg-neutral-900"
                  : i < stepIndex
                    ? "bg-neutral-400"
                    : "bg-stone-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm md:p-6">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">
          {label}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{prompt}</p>

        <div className="mt-7 space-y-7">
          {READINGS.map((r) => {
            const value = values[r.key];
            const set = value !== undefined;
            return (
              <div key={r.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <label
                    htmlFor={`${area}-${r.key}`}
                    className="text-sm font-medium text-neutral-800"
                  >
                    {r.label}
                  </label>
                  <span
                    className={`min-w-9 rounded-md px-2 py-0.5 text-center text-sm font-semibold ${
                      set
                        ? "bg-neutral-900 text-white"
                        : "bg-stone-100 text-neutral-400"
                    }`}
                  >
                    {set ? value : "—"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">{r.help}</p>
                <input
                  id={`${area}-${r.key}`}
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={value ?? 5}
                  disabled={saving}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [r.key]: Number(e.target.value) }))
                  }
                  className={`mt-3 w-full accent-neutral-900 ${set ? "" : "opacity-60"}`}
                  aria-valuetext={set ? String(value) : "not set"}
                />
                <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                  <span>{r.low} (1)</span>
                  <span>{r.high} (10)</span>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <div className="mt-7 flex items-center justify-between">
          <button
            type="button"
            onClick={() => prevArea && router.push(`/audit/${prevArea}`)}
            disabled={!prevArea || saving}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-stone-100 disabled:invisible"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!complete || saving}
            className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {saving
              ? isLast
                ? "Building your Gap Map…"
                : "Saving…"
              : error
                ? "Retry"
                : isLast
                  ? "See my Gap Map"
                  : "Next →"}
          </button>
        </div>
        {!complete && (
          <p className="mt-3 text-right text-xs text-neutral-400">
            Set all four readings to continue
          </p>
        )}
      </div>
    </div>
  );
}
