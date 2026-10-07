import type { ReactNode } from "react";
import { AlertIcon } from "./icons";

type Props = {
  title: string;
  message?: string;
  children?: ReactNode;
};

export function ErrorState({ title, message, children }: Props) {
  return (
    <div role="alert" className="flex gap-3 rounded-xl border-2 border-ember bg-paper p-4 text-plum">
      <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        {message && <p className="mt-1 text-base leading-relaxed">{message}</p>}
        {children && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
}
