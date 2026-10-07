import { SEGMENTS, type SegmentId } from "@/lib/segmentation";
import { smart } from "@/lib/typography";
import type { Answers } from "@/lib/types";

export function ResultCard({ segment, answers }: { segment: SegmentId; answers: Answers }) {
  const data = SEGMENTS[segment];
  const rows: Array<[string, string | undefined]> = [
    ["Biggest challenge", answers.biggest_challenge],
    ["Most want to improve", answers.improvement_priority],
  ];
  return (
    <section aria-labelledby="result-heading" className="rounded-2xl border-2 border-plum bg-plum p-6 text-cream sm:p-8">
      <p className="text-sm font-semibold text-cream/80">Your profile</p>
      <h3 id="result-heading" className="mt-1 font-display text-3xl font-semibold leading-tight sm:text-4xl">
        {data.displayName}
      </h3>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-cream/95">{smart(data.message)}</p>
      <dl className="mt-6 grid gap-4 border-t border-cream/20 pt-5 sm:grid-cols-2">
        {rows.map(([label, value]) =>
          value ? (
            <div key={label}>
              <dt className="text-sm font-semibold text-cream/75">{label}</dt>
              <dd className="mt-0.5 text-base">{smart(value)}</dd>
            </div>
          ) : null
        )}
      </dl>
    </section>
  );
}
