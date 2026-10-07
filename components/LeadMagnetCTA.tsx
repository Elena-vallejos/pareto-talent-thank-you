import { DownloadIcon } from "./icons";

type Props = {
  pdfUrl: string | null;
  email: string;
  bookingUrl?: string;
  onDownload: () => void;
  onBookingClick: () => void;
};

export function LeadMagnetCTA({ pdfUrl, email, bookingUrl, onDownload, onBookingClick }: Props) {
  return (
    <section aria-label="Your guide" className="space-y-5">
      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          onClick={onDownload}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-ember px-8 py-5 text-lg font-semibold text-plum transition-colors hover:bg-[#ff6a26] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-plum sm:w-auto sm:text-xl"
        >
          <DownloadIcon />
          Download My Pareto Talent Guide
        </a>
      ) : (
        <p className="text-lg font-semibold">Your guide is on its way to {email}.</p>
      )}

      <p className="text-base leading-relaxed text-plum/85">
        Check your inbox &mdash; we&rsquo;ve also sent your guide to your email.
        {email && pdfUrl && <span className="block text-sm text-plum/75">Sent to {email}</span>}
      </p>

      {bookingUrl && (
        <div className="border-t border-plum/15 pt-5">
          <p className="text-base leading-relaxed">
            Want to apply it to your business? Book a conversation with Mara Elena.
          </p>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onBookingClick}
            className="mt-3 inline-flex rounded-full border-2 border-plum px-6 py-3 text-base font-semibold text-plum transition-colors hover:bg-plum hover:text-cream focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            Book a conversation
          </a>
        </div>
      )}
    </section>
  );
}
