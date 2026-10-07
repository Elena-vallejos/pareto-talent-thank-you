import { useState, type FormEvent } from "react";
import { isValidEmail } from "@/lib/validation";
import type { Lead } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { TextInput } from "./TextInput";

type Props = {
  initial: Lead;
  onDone: (lead: Lead) => void;
};

/** Fallback shown only when the first form's data didn't arrive in the URL. */
export function ContactCard({ initial, onDone }: Props) {
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<{ first_name?: string; email?: string }>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!draft.first_name.trim()) next.first_name = "Enter your first name.";
    if (!isValidEmail(draft.email.trim())) next.email = "Enter a valid email address, like name@company.com.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onDone({ ...draft, first_name: draft.first_name.trim(), email: draft.email.trim() });
  };

  return (
    <section aria-labelledby="contact-heading" className="space-y-3">
      <ChatMessage from="assistant">
        <p id="contact-heading">First, where should I send your guide?</p>
      </ChatMessage>
      <form onSubmit={submit} noValidate className="space-y-4 pl-11">
        <TextInput
          label="First name"
          name="first_name"
          autoComplete="given-name"
          value={draft.first_name}
          onChange={(v) => setDraft({ ...draft, first_name: v })}
          error={errors.first_name}
          required
        />
        <TextInput
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          value={draft.email}
          onChange={(v) => setDraft({ ...draft, email: v })}
          error={errors.email}
          required
        />
        <button
          type="submit"
          className="rounded-full bg-ember px-6 py-3 text-base font-semibold text-plum transition-colors hover:bg-[#ff6a26] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-plum"
        >
          Start the assessment
        </button>
      </form>
    </section>
  );
}
