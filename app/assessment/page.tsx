import { getLifeAreas } from "@/lib/data/life-areas";
import AssessmentFlow from "@/components/assessment-flow";

export const revalidate = 0;

export const metadata = {
  title: "Take the Assessment — Gap Assessment",
};

export default async function AssessmentPage() {
  const areas = await getLifeAreas();

  if (areas.length === 0) {
    return (
      <div className="max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        We couldn&apos;t load the life areas. Please refresh the page to try
        again.
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Your Gap Assessment
        </h1>
        <p className="mt-1.5 text-sm text-neutral-600">
          For each of the six life areas, answer four quick questions. Be
          honest — the gap only closes once you can see it.
        </p>
      </header>
      <AssessmentFlow areas={areas} />
    </div>
  );
}
