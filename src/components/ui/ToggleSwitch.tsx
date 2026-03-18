type ToggleSwitchProps = {
  checked?: boolean;
};

export function ToggleSwitch({ checked = false }: ToggleSwitchProps) {
  return (
    <div
      className={`relative h-6 w-11 rounded-full border transition-all ${
        checked
          ? "border-fuchsia-500 bg-fuchsia-500/80"
          : "border-white/10 bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ${
          checked ? "translate-x-[19px]" : "translate-x-0.5"
        }`}
      />
    </div>
  );
}