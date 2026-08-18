import Link from "next/link";
import { Suspense } from "react";
import { getGapMap } from "@/lib/data/assessments";
import { GapMap, GapMapSkeleton } from "@/components/gap-map";

export const revalidate = 0;

export const metadata = {
  title: "Your Gap Map — Gap Assessment",
};

function EmptyState() {
  return (
    <div className="max-w-xl rounded-xl border border-neutral-200 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-neutral-900">
        We couldn&apos;t find that Gap Map
      </h2>
      <p className="mt-2 text-sm text-neutral-600">
        It may have been removed, or the link is incorrect. Take a fresh
        assessment to see where you stand.
      </p>
      <Link
        href="/assessment"
        className="mt-5 inline-block rounded-lg bg-purple-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-800"
      >
        Start Your Assessment
      </Link>
    </div>
  );
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function Results({ id }: { id: string }) {
  const gapMap = UUID_RE.test(id) ? await getGapMap(id) : null;
  if (!gapMap) return <EmptyState />;

  return (
    <div className="max-w-4xl">
      <GapMap areas={gapMap.areas} />
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/assessment"
          className="rounded-lg bg-purple-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-800"
        >
          Start New Assessment
        </Link>
        <p className="text-xs text-neutral-500">
          Bookmark this page to come back to these results.
        </p>
      </div>
    </div>
  );
}

export default async function ResultsByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <header className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Your Gap Map
        </h1>
        <p className="mt-1.5 text-sm text-neutral-600">
          Areas are ranked by priority, then by gap size. 🔥 means stress has
          you in fight-or-flight; 🌫 means you&apos;re running on autopilot
          there.
        </p>
      </header>
      <Suspense fallback={<GapMapSkeleton />}>
        <Results id={id} />
      </Suspense>
    </div>
  );
}
