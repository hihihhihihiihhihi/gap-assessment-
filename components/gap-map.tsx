import { overallGap, type AreaResult, type Priority } from "@/lib/assessment/scoring";

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
  const highCount = areas.filter((a) => a.priority === "high").length;
  const ffCount = areas.filter((a) => a.fight_flight).length;

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-purple-700">{avg}</div>
          <div className="mt-1 text-xs text-neutral-500">Average gap</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{ffCount}</div>
          <div className="mt-1 text-xs text-neutral-500">Areas in fight/flight</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{highCount}</div>
          <div className="mt-1 text-xs text-neutral-500">High-priority areas</div>
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
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100"
          />
        ))}
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
