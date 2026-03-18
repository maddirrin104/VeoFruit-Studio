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
      className={`flex w-full flex-col items-center justify-center rounded-2xl border text-center transition-all
      ${compact ? "min-h-[46px] px-3 py-3 text-sm" : "min-h-[64px] px-4 py-4"}
      ${
        active
          ? "border-fuchsia-500/80 bg-fuchsia-500/15 text-white shadow-[inset_0_0_25px_rgba(168,85,247,0.18)]"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
      }
      ${className}`}
    >
      <span className="font-semibold">{label}</span>
      {subLabel && <span className="mt-1 text-xs text-slate-400">{subLabel}</span>}
    </button>
  );
}