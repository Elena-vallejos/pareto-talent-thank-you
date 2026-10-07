import { PRIVACY_URL } from "@/lib/config";
import { QUESTIONS, type AnswerKey } from "@/lib/questions";
import { smart } from "@/lib/typography";
import type { Answers } from "@/lib/types";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { SpinnerIcon } from "./icons";

type Props = {
  answers: Answers;
  submitting: boolean;
  errorMessage: string;
  missing: AnswerKey[];
  honeypot: string;
  onHoneypot: (value: string) => void;
  onEdit: (index: number) => void;
  onSubmit: () => void;
};

export function SummaryCard({ answers, submitting, errorMessage, missing, honeypot, onHoneypot, onEdit, onSubmit }: Props) {
  return (
    <section aria-labelledby="summary-heading" className="rounded-2xl border-2 border-plum bg-paper p-5 sm:p-7">
      <h3 id="summary-heading" className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
        Your Pareto Talent Guide is ready.
      </h3>
      <p className="mt-3 text-base leading-relaxed text-plum/85 sm:text-lg">
        Based on your answers, we&rsquo;ve captured what you&rsquo;re looking to improve and where you may have the greatest
        opportunity for leverage.
      </p>

      <dl className="mt-6 divide-y divide-plum/10 border-y border-plum/10">
        {QUESTIONS.map((q, i) => (
          <div key={q.id} className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
              <dt className="text-sm font-semibold text-plum/75">{q.step}</dt>
              <dd className="mt-0.5 break-words text-base text-plum">
                {answers[q.id] ? smart(answers[q.id] as string) : <span className="text-plum/60">Skipped</span>}
              </dd>
            </div>
            <button
              type="button"
              onClick={() => onEdit(i)}
              disabled={submitting}
              aria-label={`Edit ${q.step}`}
              className="shrink-0 rounded px-1 py-1.5 text-sm font-medium text-plum/75 underline underline-offset-2 hover:text-plum focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-ember disabled:opacity-50"
            >
              Edit
            </button>
          </div>
        ))}
      </dl>

      {/* Honeypot: hidden from people, tempting for bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => onHoneypot(e.target.value)} />
        </label>
      </div>

      <div className="mt-6 space-y-4">
        {missing.length > 0 && (
          <ErrorState title="A few answers are still missing." message="Add them and we'll send your guide.">
            {missing.map((id) => {
              const index = QUESTIONS.findIndex((q) => q.id === id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onEdit(index)}
                  className="rounded-full border-2 border-plum px-4 py-1.5 text-sm font-semibold text-plum hover:bg-plum hover:text-cream focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ember"
                >
                  Answer: {QUESTIONS[index].step}
                </button>
              );
            })}
          </ErrorState>
        )}
        {errorMessage && <ErrorState title="We couldn't send your guide." message={errorMessage} />}

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2.5 rounded-full bg-ember px-7 py-4 text-lg font-semibold text-plum transition-colors enabled:hover:bg-[#ff6a26] disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-plum sm:w-auto"
        >
          {submitting && <SpinnerIcon className="h-5 w-5" />}
          {submitting ? "Sending..." : errorMessage ? "Try again" : "Send Me My Pareto Talent Guide"}
        </button>
        {submitting && <LoadingState />}

        <p className="text-base text-plum/85">We&rsquo;ll use your answers to personalize your next steps.</p>
        <p className="text-sm leading-relaxed text-plum/75">
          Your information is used only to provide your Pareto Talent Guide and improve your experience.{" "}
          <a href={PRIVACY_URL} className="font-medium text-plum underline underline-offset-2 hover:no-underline" target={PRIVACY_URL === "#" ? undefined : "_blank"} rel="noopener noreferrer">
            Privacy Policy
          </a>
        </p>
      </div>
    </section>
  );
}
