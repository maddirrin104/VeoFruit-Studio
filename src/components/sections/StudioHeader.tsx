import {
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function StudioHeader() {
  return (
    <header className="mb-7 flex flex-col items-center text-center md:mb-8">
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

      <p className="mt-2 text-sm text-[#6e9a86]">Powered by Google DeepMind</p>
    </header>
  );
}