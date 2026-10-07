import Image from "next/image";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type Props = {
  from: "assistant" | "user";
  children?: ReactNode;
  /** Show the "typing" indicator instead of content (assistant only). */
  typing?: boolean;
  onEdit?: () => void;
  editLabel?: string;
  muted?: boolean;
};

export function AssistantAvatar() {
  return (
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-plum" aria-hidden="true">
      <Image src="/logo-cream.png" alt="" width={20} height={20} />
    </span>
  );
}

export function ChatMessage({ from, children, typing, onEdit, editLabel = "Edit answer", muted }: Props) {
  if (from === "user") {
    return (
      <div className="flex animate-msg-in flex-col items-end gap-1 motion-reduce:animate-none">
        <div
          className={cx(
            "max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-plum px-4 py-3 text-base leading-relaxed text-cream",
            muted && "italic text-cream/80"
          )}
        >
          {children}
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={editLabel}
            className="-mr-1 rounded px-1 py-1.5 text-sm font-medium text-plum/75 underline underline-offset-2 hover:text-plum focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-ember"
          >
            Edit
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex animate-msg-in items-start gap-3 motion-reduce:animate-none">
      <AssistantAvatar />
      <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-plum/10 bg-paper px-4 py-3 text-[1.0625rem] leading-relaxed text-plum">
        {typing ? (
          <span className="flex h-6 items-center gap-1" role="status" aria-label="Typing">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 animate-dot-bounce rounded-full bg-plum motion-reduce:animate-none"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </span>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
