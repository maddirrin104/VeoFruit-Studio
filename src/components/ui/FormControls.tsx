import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

const baseFieldClass =
  "h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-fuchsia-500/70 focus:ring-2 focus:ring-fuchsia-500/20";

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className = "", ...props }: TextInputProps) {
  return <input className={`${baseFieldClass} ${className}`} {...props} />;
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea({ className = "", ...props }: TextAreaProps) {
  return (
    <textarea
      className={`w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-fuchsia-500/70 focus:ring-2 focus:ring-fuchsia-500/20 ${className}`}
      {...props}
    />
  );
}

type SelectFieldProps = {
  defaultValue: string;
  options: string[];
};

export function SelectField({ defaultValue, options }: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        defaultValue={defaultValue}
        className={`${baseFieldClass} appearance-none pr-11`}
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#141a31]">
            {option}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

type RangeFieldProps = {
  defaultValue?: number;
  minLabel: string;
  maxLabel: string;
};

export function RangeField({
  defaultValue = 50,
  minLabel,
  maxLabel,
}: RangeFieldProps) {
  return (
    <div>
      <input
        type="range"
        defaultValue={defaultValue}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-fuchsia-500"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}