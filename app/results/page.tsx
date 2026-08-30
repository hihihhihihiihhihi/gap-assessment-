import Link from "next/link";
import { redirect } from "next/navigation";
import GapMapView from "@/components/results/gap-map-view";
import EmailCapture from "@/components/results/email-capture";
import { getAuditBySession } from "@/lib/data/audits";
import { getGapMapByAudit } from "@/lib/data/gap-maps";
import { readSessionToken } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = { title: "Your Gap Map — The Gap Audit" };

export default async function ResultsPage() {
  // Empty state: a direct visit with no audit goes home, never a blank screen.
  const token = await readSessionToken();
  if (!token) redirect("/");

  const audit = await getAuditBySession(token);
  if (!audit) redirect("/");

  const gapMap = await getGapMapByAudit(audit.id);
  if (!gapMap) redirect("/api/audit/start");

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Your Gap Map
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
          Widest gap first. A{" "}
          <span className="font-medium text-amber-800">fight/flight zone</span>{" "}
          is where this life runs on survival; a{" "}
          <span className="font-medium text-sky-800">low-awareness zone</span>{" "}
          is where it&apos;s happening without you noticing.
        </p>
      </header>

      <GapMapView
        rankedAreas={gapMap.ranked_areas}
        totalGap={gapMap.total_gap}
      />

      <div className="mt-6">
        <EmailCapture initialEmail={audit.email} />
      </div>

      <div className="mt-8 border-t border-stone-200 pt-5">
        <Link
          href="/api/audit/start?fresh=1"
          prefetch={false}
          className="text-sm font-medium text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
        >
          Take the audit again
        </Link>
      </div>
    </div>
  );
}
