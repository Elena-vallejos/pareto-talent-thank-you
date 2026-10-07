import Image from "next/image";
import { cx } from "@/lib/cx";
import { QUESTIONS } from "@/lib/questions";
import type { Stage } from "@/lib/storage";
import { CheckIcon } from "./icons";

type Props = {
  firstName: string;
  stage: Stage;
  /** Number of questions already answered (including the one being answered). */
  done: number;
  canNavigate: boolean;
  onGoTo: (index: number) => void;
};

function StepList({ stage, done, canNavigate, onGoTo }: Omit<Props, "firstName">) {
  return (
    <ol className="space-y-1">
      {QUESTIONS.map((q, i) => {
        const isDone = i < done;
        const isCurrent = stage === "questions" && i === done;
        const clickable = isDone && canNavigate;
        const inner = (
          <>
            <span
              aria-hidden="true"
              className={cx(
                "absolute left-0 top-1.5 flex h-[1.375rem] w-[1.375rem] items-center justify-center rounded-full border-2",
                isDone && "border-ember bg-ember text-plum",
                isCurrent && "border-ember",
                !isDone && !isCurrent && "border-cream/30"
              )}
            >
              {isDone && <CheckIcon className="h-3 w-3" />}
              {isCurrent && <span className="h-2 w-2 rounded-full bg-ember" />}
            </span>
            <span
              className={cx(
                "text-[0.9375rem] leading-8",
                isCurrent ? "font-semibold text-cream" : isDone ? "text-cream/90" : "text-cream/60"
              )}
            >
              {q.step}
            </span>
            {isCurrent && <span className="sr-only"> (current question)</span>}
          </>
        );
        return (
          <li
            key={q.id}
            className={cx(
              "relative pl-9",
              i < QUESTIONS.length - 1 &&
                "after:absolute after:left-[0.6875rem] after:top-8 after:h-[calc(100%-1.25rem)] after:w-px after:bg-cream/20"
            )}
          >
            {clickable ? (
              <button
                type="button"
                onClick={() => onGoTo(i)}
                aria-label={`Go back to ${q.step}`}
                className="block w-full text-left hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                {inner}
              </button>
            ) : (
              <div>{inner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function Hero({ firstName, stage, done, canNavigate, onGoTo }: Props) {
  const finished = stage === "success";
  return (
    <aside className="bg-plum text-cream lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[27rem] lg:shrink-0 lg:flex-col lg:justify-between lg:overflow-y-auto xl:w-[31rem]">
      <div className="px-5 pb-8 pt-6 sm:px-8 lg:p-10 xl:p-14">
        <Image src="/logo-cream.png" alt="Pareto Talent" width={44} height={44} priority />
        <div className="mt-8 lg:mt-12">
          {firstName && (
            <p className="text-base text-cream/85">
              {finished ? "Thank you for your time." : `Thank you, ${firstName}. Your details are in.`}
            </p>
          )}
          <h1 className="mt-3 font-display text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-[2.6rem] xl:text-5xl">
            {finished
              ? firstName
                ? `You\u2019re all set, ${firstName}.`
                : "You\u2019re all set."
              : "You\u2019re One Step Away From Your Pareto Talent Guide."}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-cream/90 lg:text-lg">
            {finished
              ? "Your answers are in and your guide is ready to download."
              : "Let\u2019s understand where you\u2019re spending your energy, where you\u2019re creating the most value, and what could be limiting your growth."}
          </p>
        </div>
      </div>

      <nav aria-label="Assessment steps" className="hidden px-10 pb-10 lg:block xl:px-14 xl:pb-14">
        <StepList stage={stage} done={done} canNavigate={canNavigate} onGoTo={onGoTo} />
      </nav>
    </aside>
  );
}
