import { Settings, ShieldCheck, Sparkles } from "lucide-react";

type StudioHeaderProps = {
  onSettingsClick: () => void;
};

export function StudioHeader({ onSettingsClick }: StudioHeaderProps) {
  return (
    <header className="relative mb-7 md:mb-8">
      {/* Centered title block */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 inline-flex items-center gap-3 rounded-2xl border border-[#bde4cd] bg-[#eff9f3] px-4 py-2 shadow-[0_12px_28px_rgba(31,118,76,0.14)]">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#20c06f] to-[#0cab5d] text-white shadow-[0_8px_16px_rgba(14,171,92,0.3)]">
            <ShieldCheck className="size-5" />
          </span>
          <h1 className="font-[family:var(--font-sora)] text-[40px] font-semibold tracking-tight text-[#039f57] md:text-[46px]">
            VeoFruit Studio
          </h1>
          <Sparkles className="size-5 text-[#0eb35f]" />
        </div>

        <p className="mt-1 text-[20px] text-[#2f6f56] md:text-[22px]">
          Tạo video giới thiệu trái cây tự động với AI
        </p>

        <div className="mt-2 flex items-center gap-2">
          <p className="text-sm text-[#6e9a86]">Powered by Google DeepMind</p>
          <span className="rounded-full border border-[#bde4cd] bg-[#e8f7ee] px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-[#0e7a42]">
            v2.0
          </span>
        </div>
      </div>

      {/* Settings button — absolute top-right */}
      <button
        type="button"
        onClick={onSettingsClick}
        className="absolute right-0 top-0 inline-flex items-center gap-2 rounded-xl border border-[#b8dfc8] bg-[#f0fbf5] px-4 py-2.5 text-sm font-semibold text-[#2a7a52] shadow-sm transition hover:border-[#7fcea5] hover:bg-[#e1f7ec] hover:text-[#0a7a3c]"
        aria-label="Mở cấu hình API"
      >
        <Settings className="size-4" />
        Cài đặt
      </button>
    </header>
  );
}
