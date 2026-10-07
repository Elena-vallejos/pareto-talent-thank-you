import { cx } from "@/lib/cx";

type Props = {
  value: number;
  max: number;
  label: string;
  tone?: "light" | "dark";
};

export function ProgressBar({ value, max, label, tone = "dark" }: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <p className={cx("mb-2 text-sm font-semibold", tone === "dark" ? "text-plum" : "text-cream")}>{label}</p>
      <div
        role="progressbar"
        aria-label="Assessment progress"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cx("h-2 w-full overflow-hidden rounded-full", tone === "dark" ? "bg-plum/15" : "bg-cream/20")}
      >
        <div
          className="h-full rounded-full bg-ember transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
