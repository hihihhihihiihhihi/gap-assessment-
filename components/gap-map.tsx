import {
  alignmentBand,
  alignmentPct,
  overallGap,
  type AreaResult,
  type Priority,
} from "@/lib/assessment/scoring";
import RadarChart from "@/components/radar-chart";

const PRIORITY_STYLES: Record<Priority, { label: string; badge: string; ring: string }> = {
  high: {
    label: "High priority",
    badge: "bg-red-100 text-red-800",
    ring: "border-red-200",
  },
  medium: {
    label: "Medium priority",
    badge: "bg-amber-100 text-amber-800",
    ring: "border-amber-200",
  },
  low: {
    label: "Low priority",
    badge: "bg-emerald-100 text-emerald-800",
    ring: "border-emerald-200",
  },
};

function ScoreBar({
  current,
  desired,
}: {
  current: number;
  desired: number;
}) {
  return (
    <div className="relative h-2 w-full rounded-full bg-neutral-200" aria-hidden>
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-purple-300"
        style={{ width: `${desired * 10}%` }}
      />
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-purple-600"
        style={{ width: `${current * 10}%` }}
      />
    </div>
  );
}

export function GapMapCard({ area }: { area: AreaResult }) {
  const p = PRIORITY_STYLES[area.priority];
  return (
    <div className={`rounded-xl border ${p.ring} bg-white p-5 shadow-sm`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-neutral-900">{area.life_area_name}</h3>
          {area.life_area_description && (
            <p className="mt-0.5 text-xs text-neutral-500">
              {area.life_area_description}
            </p>
          )}
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.badge}`}
        >
          {p.label}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex justify-between text-xs text-neutral-500">
            <span>
              Current <strong className="text-neutral-800">{area.current_score}</strong>
            </span>
            <span>
              Desired <strong className="text-neutral-800">{area.desired_score}</strong>
            </span>
          </div>
          <ScoreBar current={area.current_score} desired={area.desired_score} />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-700">
            {area.gap_score > 0 ? `+${area.gap_score}` : area.gap_score}
          </div>
          <div className="text-[11px] uppercase tracking-wide text-neutral-400">
            Gap
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {area.fight_flight ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
            🔥 Fight / flight — stress {area.stress_level}/5
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
            Stress {area.stress_level}/5
          </span>
        )}
        {area.low_awareness ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            🌫 Low awareness — {area.awareness_level}/5
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
            Awareness {area.awareness_level}/5
          </span>
        )}
      </div>
    </div>
  );
}

export function GapMap({ areas }: { areas: AreaResult[] }) {
  const avg = overallGap(areas);
  const ffCount = areas.filter((a) => a.fight_flight).length;
  const pct = alignmentPct(areas);
  const band = alignmentBand(pct);

  // areas arrive ranked by priority then gap — worst first, best last
  const priorityGaps = areas.filter((a) => a.priority !== "low").slice(0, 3);
  const strengths = [...areas]
    .reverse()
    .filter((a) => a.priority === "low")
    .slice(0, 3);

  return (
    <div>
      <div className="mb-6 grid gap-4 lg:grid-cols-5">
        {/* Radar: current vs desired */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="text-sm font-semibold text-neutral-900">
            Current vs desired life
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            The dashed line is the life you want; the filled shape is where you
            are today.
          </p>
          <div className="mx-auto mt-2 max-w-sm">
            <RadarChart areas={areas} />
          </div>
        </div>

        {/* Summary: alignment + strengths + priority gaps */}
        <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-purple-700 text-lg font-bold text-white">
              {pct}%
            </div>
            <div>
              <div className="font-semibold text-neutral-900">{band.label}</div>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">
                {band.summary}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 text-center">
            <div>
              <div className="text-xl font-bold text-purple-700">{avg}</div>
              <div className="mt-0.5 text-[11px] text-neutral-500">
                Average gap
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">{ffCount}</div>
              <div className="mt-0.5 text-[11px] text-neutral-500">
                Areas in fight/flight
              </div>
            </div>
          </div>

          {priorityGaps.length > 0 && (
            <div className="border-t border-neutral-100 pt-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-red-700">
                Priority gaps
              </h4>
              <ul className="mt-2 space-y-1.5">
                {priorityGaps.map((a) => (
                  <li
                    key={a.life_area_id}
                    className="flex items-center justify-between gap-2 text-sm text-neutral-800"
                  >
                    <span>{a.life_area_name}</span>
                    <span className="text-xs font-semibold text-red-600">
                      +{a.gap_score}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {strengths.length > 0 && (
            <div className="border-t border-neutral-100 pt-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Top strengths
              </h4>
              <ul className="mt-2 space-y-1.5">
                {strengths.map((a) => (
                  <li
                    key={a.life_area_id}
                    className="flex items-center justify-between gap-2 text-sm text-neutral-800"
                  >
                    <span>{a.life_area_name}</span>
                    <span className="text-xs font-semibold text-emerald-600">
                      +{a.gap_score}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {areas.map((area) => (
          <GapMapCard key={area.life_area_id} area={area} />
        ))}
      </div>
    </div>
  );
}

export function GapMapSkeleton() {
  return (
    <div>
      <div className="mb-6 grid gap-4 lg:grid-cols-5">
        <div className="h-80 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 lg:col-span-3" />
        <div className="h-80 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 lg:col-span-2" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100"
          />
        ))}
      </div>
    </div>
  );
}
