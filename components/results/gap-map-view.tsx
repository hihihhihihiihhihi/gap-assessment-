import { AREA_LABELS, type RankedArea } from "@/lib/scoring/gap-calculator";
import RadarChart from "@/components/results/radar-chart";

// Series colors validated for CVD separation on a light surface
// (now #9333ea vs want #0d9488 — deutan dE 19.6, tritan 17.0).
const NOW_COLOR = "#9333ea";
const WANT_COLOR = "#0d9488";
const SCALE_MAX = 10;

function pct(value: number) {
  return `${(value / SCALE_MAX) * 100}%`;
}

function GapRow({ area, rank }: { area: RankedArea; rank: number }) {
  // Stored gap_maps JSON may predate the per-area readings; degrade to the
  // gap number alone rather than rendering empty labels.
  const hasReadings = Number.isFinite(area.now) && Number.isFinite(area.want);
  const left = hasReadings ? Math.min(area.now, area.want) : 0;
  const width = hasReadings ? Math.abs(area.want - area.now) : 0;

  return (
    <li className="border-t border-stone-200 py-4 first:border-t-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-900">
          <span className="mr-2 text-xs font-normal text-neutral-400">
            {rank}
          </span>
          {AREA_LABELS[area.area]}
        </h3>
        <span className="text-sm">
          <span className="font-semibold text-neutral-900">
            {area.gap > 0 ? `+${area.gap}` : area.gap}
          </span>
          <span className="ml-1 text-xs text-neutral-500">the gap</span>
        </span>
      </div>

      {/* Range bar: the distance between the current and where she wants to be */}
      {hasReadings && (
        <>
      <div className="relative mt-3 h-2 w-full rounded-full bg-stone-200">
        <div
          className="absolute inset-y-0 rounded-full bg-neutral-300"
          style={{ left: pct(left), width: pct(width) }}
        />
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
          style={{ left: pct(area.now), backgroundColor: NOW_COLOR }}
          aria-hidden
        />
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
          style={{ left: pct(area.want), backgroundColor: WANT_COLOR }}
          aria-hidden
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-neutral-500">
        <span>
          The current: <strong className="text-neutral-800">{area.now}</strong>
        </span>
        <span>
          Where you want to be:{" "}
          <strong className="text-neutral-800">{area.want}</strong>
        </span>
      </div>
        </>
      )}

      {(area.stress_flag || area.awareness_flag) && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {area.stress_flag && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
              <span aria-hidden>▲</span> Fight/flight zone
              {Number.isFinite(area.stress) ? " — stress " + area.stress + "/10" : ""}
            </span>
          )}
          {area.awareness_flag && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800">
              <span aria-hidden>◐</span> Low awareness
              {Number.isFinite(area.awareness) ? " — " + area.awareness + "/10" : ""}
            </span>
          )}
        </div>
      )}
    </li>
  );
}

export default function GapMapView({
  rankedAreas,
  totalGap,
  compact = false,
}: {
  rankedAreas: RankedArea[];
  totalGap: number;
  compact?: boolean;
}) {
  const fightFlight = rankedAreas.filter((a) => a.stress_flag);
  const lowAwareness = rankedAreas.filter((a) => a.awareness_flag);

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-bold tracking-tight text-neutral-900">
            {totalGap}
          </div>
          <div className="mt-0.5 text-xs text-neutral-500">
            Total gap across six areas
          </div>
        </div>
        <div className="flex gap-5 text-xs text-neutral-600">
          <div>
            <div className="text-lg font-semibold text-amber-700">
              {fightFlight.length}
            </div>
            <div className="text-neutral-500">in fight/flight</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-sky-700">
              {lowAwareness.length}
            </div>
            <div className="text-neutral-500">low awareness</div>
          </div>
        </div>
      </div>

      {!compact && rankedAreas.length >= 3 && (
        <div className="mt-6 border-t border-stone-200 pt-5">
          <RadarChart areas={rankedAreas} />
        </div>
      )}

      <ul className="mt-5 border-t border-stone-200 pt-1">
        {rankedAreas.map((area, i) => (
          <GapRow key={area.area} area={area} rank={i + 1} />
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-center gap-5 border-t border-stone-200 pt-4 text-xs text-neutral-600">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: NOW_COLOR }}
          />
          The current
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: WANT_COLOR }}
          />
          Where you want to be
        </span>
      </div>
    </div>
  );
}

export function GapMapSkeleton() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <div className="h-10 w-24 animate-pulse rounded bg-stone-100" />
      <div className="mt-6 space-y-5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-stone-100" />
            <div className="h-2 w-full animate-pulse rounded-full bg-stone-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
