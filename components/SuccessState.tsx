import { BOOKING_URL } from "@/lib/config";
import { EXPLORE } from "@/lib/questions";
import type { Answers, SubmitSuccess } from "@/lib/types";
import { LeadMagnetCTA } from "./LeadMagnetCTA";
import { ResultCard } from "./ResultCard";

type Props = {
  result: SubmitSuccess;
  email: string;
  answers: Answers;
  onDownload: () => void;
  onBookingClick: () => void;
};

export function SuccessState({ result, email, answers, onDownload, onBookingClick }: Props) {
  const wantsToExplore = answers.explore_application === EXPLORE.YES || result.intent_level === "HIGH";
  return (
    <div className="space-y-8">
      <header>
        <p className="inline-flex rounded-full bg-plum px-3 py-1 text-sm font-semibold text-cream">Step 2 of 2</p>
        <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Your Pareto Talent Guide is Ready.
        </h2>
      </header>
      <ResultCard segment={result.segment} answers={answers} />
      <LeadMagnetCTA
        pdfUrl={result.pdf_url}
        email={email}
        bookingUrl={wantsToExplore ? BOOKING_URL : ""}
        onDownload={onDownload}
        onBookingClick={onBookingClick}
      />
    </div>
  );
}
