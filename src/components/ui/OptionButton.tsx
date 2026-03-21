type OptionButtonProps = {
  label: string;
  subLabel?: string;
  active?: boolean;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
};

export function OptionButton({
  label,
  subLabel,
  active = false,
  compact = false,
  className = "",
  onClick,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col items-center justify-center rounded-xl border text-center transition-all duration-200
      ${compact ? "min-h-10.5 px-3 py-2 text-sm" : "min-h-14 px-4 py-3"}
      ${
        active
          ? "border-[#12ba64] bg-[#d9f7e4] text-[#0d7a43] shadow-[0_8px_18px_rgba(18,186,100,0.14)]"
          : "border-[#c8e7d6] bg-[#edf8f2] text-[#2d6a52] hover:-translate-y-px hover:border-[#9fdab9] hover:bg-[#e7f5ed]"
      }
      ${className}`}
    >
      <span className="font-semibold">{label}</span>
      {subLabel && <span className="mt-1 text-xs text-[#5f8e78]">{subLabel}</span>}
    </button>
  );
}