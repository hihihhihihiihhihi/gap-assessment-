import Link from "next/link";
import { Suspense } from "react";
import { getGapMap, DEMO_ASSESSMENT_ID } from "@/lib/data/assessments";
import { GapMap, GapMapSkeleton } from "@/components/gap-map";

export const revalidate = 0;

async function DemoGapMap() {
  const gapMap = await getGapMap(DEMO_ASSESSMENT_ID);
  if (!gapMap) {
    return (
      <p className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
        Demo data isn&apos;t available right now — but your own Gap Map is one
        assessment away.
      </p>
    );
  }
  return <GapMap areas={gapMap.areas} />;
}

export default function HomePage() {
  return (
    <div className="max-w-4xl">
      <section className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wide text-purple-600">
          For women who lead
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
          See the gap between the life you have and the life you want
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          High-achieving women often run in chronic fight-or-flight mode without
          noticing what it costs. Rate six life areas — career, health,
          relationships, finances, growth, and purpose — and get a personal Gap
          Map showing where you&apos;re in survival mode and where awareness is
          low. No account needed.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/assessment"
            className="rounded-lg bg-purple-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-800"
          >
            Start Your Assessment
          </Link>
          <span className="text-xs text-neutral-500">
            6 areas · 4 questions each · about 3 minutes
          </span>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Example Gap Map
          </h2>
          <span className="text-xs text-neutral-400">Demo data</span>
        </div>
        <Suspense fallback={<GapMapSkeleton />}>
          <DemoGapMap />
        </Suspense>
      </section>
    </div>
  );
}
