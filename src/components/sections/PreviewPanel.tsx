import {
  Monitor,
  Play,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

export function PreviewPanel() {
  return (
    <div className="space-y-3 xl:sticky xl:top-5 xl:self-start">
      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <Monitor className="size-4 text-[#10b862]" />
          <h2 className="text-base font-semibold uppercase tracking-wide text-[#0fa45a]">
            Xem trước video
          </h2>
        </div>

        <div className="relative flex aspect-9/16 w-full items-center justify-center rounded-xl border border-[#a7dfbe] bg-[linear-gradient(180deg,#d9f6e5_0%,#b9ebcf_100%)]">
          <span className="absolute right-3 top-3 rounded-full bg-[#effcf3] px-3 py-1 text-[11px] font-semibold text-[#10a95d] shadow-[0_6px_12px_rgba(23,96,60,0.14)]">
            720p HD
          </span>

          <div className="text-center">
            <div className="pulse-soft mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#05b25e] text-white shadow-[0_10px_22px_rgba(5,178,94,0.42)]">
              <Play className="ml-1 size-8" />
            </div>
            <p className="mt-4 text-sm text-[#39715a]">Chưa có preview</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#5f8f79]">
          Cấu hình hiện tại
        </p>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-[#d2ebdd] pb-2">
            <span className="text-[#5f8f79]">Model</span>
            <span className="font-semibold text-[#0ea75a]">Veo 3.1 Fast</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#d2ebdd] pb-2">
            <span className="text-[#5f8f79]">Resolution</span>
            <span className="font-semibold text-[#0ea75a]">720p</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#d2ebdd] pb-2">
            <span className="text-[#5f8f79]">Ratio</span>
            <span className="font-semibold text-[#0ea75a]">9:16</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#d2ebdd] pb-2">
            <span className="text-[#5f8f79]">Duration</span>
            <span className="font-semibold text-[#0ea75a]">15s</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#d2ebdd] pb-2">
            <span className="text-[#5f8f79]">Voice</span>
            <span className="font-semibold text-[#0ea75a]">Nam</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5f8f79]">Style</span>
            <span className="font-semibold text-[#0ea75a]">Cinematic</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-center">
        <span className="rounded-full border border-[#c6e2d3] bg-[#ecf8f1] px-4 py-1 text-xs font-medium text-[#698f7d]">
          5-16 giây
        </span>
      </div>
    </div>
  );
}