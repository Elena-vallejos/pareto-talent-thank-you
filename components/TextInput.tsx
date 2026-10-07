import { useId } from "react";
import { cx } from "@/lib/cx";
import { AlertIcon } from "./icons";

type Props = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email";
  autoComplete?: string;
  error?: string;
  required?: boolean;
};

export function TextInput({ label, name, value, onChange, type = "text", autoComplete, error, required }: Props) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-plum">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        inputMode={type === "email" ? "email" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "w-full rounded-xl border-2 bg-paper px-4 py-3 text-base text-plum placeholder:text-plum/50",
          "focus:border-plum focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ember/60",
          error ? "border-ember" : "border-plum/20"
        )}
      />
      {error && (
        <p id={errId} className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-plum">
          <AlertIcon className="h-4 w-4 shrink-0 text-ember" />
          {error}
        </p>
      )}
    </div>
  );
}
