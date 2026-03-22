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
      className={`relative inline-flex h-6 w-11 shrink-0 items-center overflow-hidden rounded-full border p-0.5 transition-all duration-200 ${
        checked
          ? "border-[#10b863] bg-[#14be69]"
          : "border-[#bcdfcc] bg-[#dfeee6]"
      }`}
    >
      <span
        className={`absolute left-0.3 top-0.3 h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(19,80,51,0.25)] transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}