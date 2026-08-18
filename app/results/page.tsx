"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LAST_ASSESSMENT_KEY } from "@/components/assessment-flow";
import { GapMapSkeleton } from "@/components/gap-map";

export default function ResultsIndexPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let lastId: string | null = null;
    try {
      lastId = localStorage.getItem(LAST_ASSESSMENT_KEY);
    } catch {
      // localStorage unavailable — fall through to empty state
    }
    if (lastId) {
      router.replace(`/results/${lastId}`);
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div>
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Your Gap Map
          </h1>
        </header>
        <GapMapSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-neutral-900">
          You haven&apos;t taken an assessment yet
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Answer four quick questions across six life areas and see your
          personal Gap Map — where you&apos;re in survival mode, and where
          awareness is low.
        </p>
        <Link
          href="/assessment"
          className="mt-5 inline-block rounded-lg bg-purple-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-800"
        >
          Start Your Assessment
        </Link>
      </div>
    </div>
  );
}
