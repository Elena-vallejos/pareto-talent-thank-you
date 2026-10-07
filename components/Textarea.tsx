import { useId } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
};

export function Textarea({ label, value, onChange, placeholder, maxLength, rows = 4 }: Props) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-xl border-2 border-plum/20 bg-paper px-4 py-3 text-base leading-relaxed text-plum placeholder:text-plum/50 focus:border-plum focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ember/60"
      />
    </div>
  );
}
