import Link from "next/link";
import { Suspense } from "react";
import { getAreaResponses } from "@/lib/data/area-responses";
import { buildGapMap } from "@/lib/scoring/gap-calculator";
import GapMapView, { GapMapSkeleton } from "@/components/results/gap-map-view";

export const dynamic = "force-dynamic";

/** Seeded demo audit (supabase/migrations/0001_init.sql) — renders for anonymous visitors. */
const DEMO_AUDIT_ID = "a0000000-0000-4000-8000-000000000001";

async function DemoGapMap() {
  try {
    // Built from the seeded responses rather than the stored gap_maps JSON:
    // the seed JSON carries only {area, gap, flags}, so the per-area readings
    // would render blank.
    const responses = await getAreaResponses(DEMO_AUDIT_ID);
    if (responses.length === 0) return null;
    const gapMap = buildGapMap(
      responses.map((r) => ({
        area: r.area,
        now_score: Number(r.now_score),
        want_score: Number(r.want_score),
        stress_level: Number(r.stress_level),
        awareness_level: Number(r.awareness_level),
      })),
    );
    return (
      <section className="mt-12">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            What a Gap Map looks like
          </h2>
          <span className="text-xs text-neutral-400">Sample</span>
        </div>
        <GapMapView
          rankedAreas={gapMap.ranked_areas}
          totalGap={gapMap.total_gap}
          compact
        />
      </section>
    );
  } catch {
    // A sample that won't load must never block the audit itself.
    return null;
  }
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      {error === "start" && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          We couldn&apos;t start your audit just now. Please try again.
        </div>
      )}

      <p className="text-xs font-medium uppercase tracking-[0.15em] text-amber-700">
        The Gap Audit
      </p>
      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
        You can&apos;t close a gap you can&apos;t see.
      </h1>
      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-neutral-700">
        <p>
          From the outside it looks like you&apos;re holding it all together.
          Inside, a good deal of it runs on fight/flight — and you&apos;ve been
          moving too fast to notice how much.
        </p>
        <p>
          This audit takes about three minutes. Six areas of your life, four
          honest readings each: where you are now, where you want to be, how
          much of it runs on stress, and how aware of it you actually are.
          Then you&apos;ll see the gap, named and ranked.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/api/audit/start"
          prefetch={false}
          className="rounded-lg bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800"
        >
          Start the Audit
        </Link>
        <span className="text-xs text-neutral-500">
          6 areas · 4 readings each · no login
        </span>
      </div>

      <Suspense fallback={<div className="mt-12"><GapMapSkeleton /></div>}>
        <DemoGapMap />
      </Suspense>
    </div>
  );
}
