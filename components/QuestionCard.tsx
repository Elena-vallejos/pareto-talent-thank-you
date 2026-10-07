import { useEffect, useRef } from "react";
import { cx } from "@/lib/cx";
import type { Question } from "@/lib/questions";
import { smart } from "@/lib/typography";
import { ChatMessage } from "./ChatMessage";
import { ArrowLeftIcon } from "./icons";
import { OptionButton } from "./OptionButton";
import { Textarea } from "./Textarea";

type Props = {
  question: Question;
  value: string;
  onChoose: (value: string) => void;
  onTextChange: (value: string) => void;
  /** Continue with the current answer (text questions, or re-visiting a choice). */
  onContinue: () => void;
  onBack?: () => void;
  focusOnMount?: boolean;
};

export function QuestionCard({ question, value, onChoose, onTextChange, onContinue, onBack, focusOnMount }: Props) {
  const ref = useRef<HTMLElement>(null);
  const headingId = `q-${question.id}`;

  useEffect(() => {
    if (focusOnMount) ref.current?.focus({ preventScroll: true });
  }, [focusOnMount, question.id]);

  const hasValue = value.trim().length > 0;

  return (
    <section ref={ref} tabIndex={-1} aria-labelledby={headingId} className="space-y-3 outline-none">
      <ChatMessage from="assistant">
        <h3 id={headingId} className="font-display text-xl font-semibold leading-snug">
          {smart(question.prompt)}
        </h3>
        {question.hint && <p className="mt-1 text-sm text-plum/75">{question.hint}</p>}
      </ChatMessage>

      <div className="pl-11">
        {question.kind === "choice" ? (
          <>
            <div
              role="group"
              aria-labelledby={headingId}
              className={cx("grid gap-2.5", question.columns === 2 ? "sm:grid-cols-2" : "grid-cols-1")}
            >
              {question.options?.map((option) => (
                <OptionButton key={option} label={option} selected={value === option} onClick={() => onChoose(option)} />
              ))}
            </div>
            {hasValue && (
              <button type="button" onClick={onContinue} className="mt-4 rounded-full bg-ember px-6 py-3 text-base font-semibold text-plum transition-colors hover:bg-[#ff6a26] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-plum">
                Keep this answer and continue
              </button>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <Textarea
              label={question.prompt}
              value={value}
              onChange={onTextChange}
              placeholder={question.placeholder}
              maxLength={question.maxLength}
            />
            <button
              type="button"
              onClick={onContinue}
              className={cx(
                "rounded-full px-6 py-3 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-plum",
                hasValue
                  ? "bg-ember text-plum hover:bg-[#ff6a26]"
                  : "border-2 border-plum/30 text-plum hover:border-plum"
              )}
            >
              {hasValue ? "Continue" : "Skip this question"}
            </button>
          </div>
        )}

        {onBack && (
          <div className="mt-5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded px-1 py-2 text-sm font-semibold text-plum/80 hover:text-plum focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-ember"
            >
              <ArrowLeftIcon />
              Back
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
