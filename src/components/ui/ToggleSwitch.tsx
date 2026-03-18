type ToggleSwitchProps = {
  checked?: boolean;
  onClick?: () => void;
};

export function ToggleSwitch({
  checked = false,
  onClick,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 overflow-hidden transition-all duration-200 ${
        checked
          ? "border-fuchsia-500 bg-fuchsia-500/90"
          : "border-white/10 bg-white/10"
      }`}
    >
      <span
        className={`absolute left-0.3 top-0.3 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}