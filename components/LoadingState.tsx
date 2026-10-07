import { SpinnerIcon } from "./icons";

export function LoadingState({ message = "Preparing your Pareto Talent Guide..." }: { message?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 text-base font-medium text-plum">
      <SpinnerIcon className="h-5 w-5 text-ember" />
      <span>{message}</span>
    </div>
  );
}
