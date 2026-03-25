import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

const baseFieldClass =
  "h-12 w-full rounded-xl border border-[#9edfb9] bg-[#e6f5eb] px-4 text-sm text-[#1e4f3c] outline-none transition-all duration-200 placeholder:text-[#7aa48f] focus:-translate-y-px focus:border-[#11b861] focus:ring-2 focus:ring-[#11b861]/20";

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className = "", ...props }: TextInputProps) {
  return <input className={`${baseFieldClass} ${className}`} {...props} />;
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea({ className = "", ...props }: TextAreaProps) {
  return (
    <textarea
      className={`w-full rounded-xl border border-[#9edfb9] bg-[#e6f5eb] px-4 py-3 text-sm text-[#1e4f3c] outline-none transition-all placeholder:text-[#7aa48f] focus:border-[#11b861] focus:ring-2 focus:ring-[#11b861]/20 ${className}`}
      {...props}
    />
  );
}

type SelectFieldProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<string | { label: string; value: string }>;
};

export function SelectField({
  defaultValue,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? { label: option, value: option }
      : { label: option.label, value: option.value }
  );

  const selectProps =
    value !== undefined
      ? { value }
      : defaultValue !== undefined
      ? { defaultValue }
      : {};

  return (
    <div className="relative">
      <select
        {...selectProps}
        onChange={(event) => onChange?.(event.target.value)}
        className={`${baseFieldClass} appearance-none pr-11`}
      >
        {normalizedOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#e6f5eb] text-[#1e4f3c]"
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#4f7d68]" />
    </div>
  );
}

type RangeFieldProps = {
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  minLabel: string;
  maxLabel: string;
};

export function RangeField({
  defaultValue = 50,
  value,
  onChange,
  minLabel,
  maxLabel,
}: RangeFieldProps) {
  const rangeProps = value !== undefined ? { value } : { defaultValue };

  return (
    <div>
      <input
        type="range"
        {...rangeProps}
        onChange={(event) => onChange?.(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-[#0db364]"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-[#5f8e78]">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}