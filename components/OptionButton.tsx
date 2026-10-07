import { cx } from "@/lib/cx";
import { smart } from "@/lib/typography";
import { CheckIcon } from "./icons";

type Props = {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export function OptionButton({ label, selected, onClick, disabled }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "flex min-h-[3.25rem] w-full items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left text-base font-medium leading-snug transition-colors duration-150",
        "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ember disabled:cursor-default",
        selected
          ? "border-plum bg-plum text-cream"
          : "border-plum/20 bg-paper text-plum enabled:hover:border-plum"
      )}
    >
      <span>{smart(label)}</span>
      <span
        aria-hidden="true"
        className={cx(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-ember bg-ember text-plum" : "border-plum/25"
        )}
      >
        {selected && <CheckIcon />}
      </span>
    </button>
  );
}
