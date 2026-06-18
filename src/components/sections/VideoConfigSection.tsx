"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { OptionButton } from "@/components/ui/OptionButton";
import { SelectField } from "@/components/ui/FormControls";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { WorkflowMode } from "@/types/studio";

type VideoConfigSectionProps = {
  workflowMode: WorkflowMode;
  resolution: "720p" | "1080p";
  aiModel: string;
  aspectRatio: "9:16" | "1:1" | "16:9" | "4:5";
  durationSeconds: number;
  onResolutionChange: (value: "720p" | "1080p") => void;
  onAspectRatioChange: (value: "9:16" | "1:1" | "16:9" | "4:5") => void;
  onDurationSecondsChange: (value: number) => void;
};

const DURATION_PRESETS = [
  { label: "10s", value: 10 },
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "3m",  value: 180 },
];

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="relative pl-2 text-[13px] font-semibold uppercase tracking-wide text-[#2f7056] before:absolute before:left-0 before:top-1 before:h-4 before:w-0.75 before:rounded-full before:bg-[#10b862]">
      {children}
    </p>
  );
}

export function VideoConfigSection({
  workflowMode,
  resolution,
  aiModel,
  aspectRatio,
  durationSeconds,
  onResolutionChange,
  onAspectRatioChange,
  onDurationSecondsChange,
}: VideoConfigSectionProps) {
  const isPresetDuration = DURATION_PRESETS.some((opt) => opt.value === durationSeconds);
  const [customDurationInput, setCustomDurationInput] = useState(
    isPresetDuration ? "" : String(durationSeconds)
  );
  const [isCustomDuration, setIsCustomDuration] = useState(!isPresetDuration);

  const clipsNeeded = durationSeconds > 10 ? Math.ceil(durationSeconds / 10) : 1;
  const multiClipHint =
    clipsNeeded > 1
      ? `Sẽ tạo ${clipsNeeded} clip 10s ghép thành video ${durationSeconds}s — khuyến nghị đặt số cảnh = ${clipsNeeded}.`
      : null;

  const aspectRatioOptions: Array<{ ratio: "9:16" | "1:1" | "16:9" | "4:5"; label: string }> = [
    { ratio: "9:16", label: "9:16 - TikTok, Reels, Shorts" },
    { ratio: "1:1",  label: "1:1 - Instagram Feed, Facebook Post" },
    { ratio: "16:9", label: "16:9 - YouTube, TV, Website" },
    { ratio: "4:5",  label: "4:5 - Instagram Feed (chiếm diện tích lớn)" },
  ];

  const selectedAspectRatioLabel =
    aspectRatioOptions.find((opt) => opt.ratio === aspectRatio)?.label ?? aspectRatio;

  function handlePresetDurationClick(value: number) {
    setIsCustomDuration(false);
    setCustomDurationInput("");
    onDurationSecondsChange(value);
  }

  function handleCustomDurationChange(raw: string) {
    setCustomDurationInput(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= 5 && parsed <= 600) {
      onDurationSecondsChange(parsed);
    }
  }

  return (
    <Card className="p-6 md:p-7">
      <SectionHeading title="Cấu hình video" icon={<Settings2 className="size-5" />} />

      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <FieldLabel>Độ phân giải</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              <OptionButton label="720p"  active={resolution === "720p"}  onClick={() => onResolutionChange("720p")} />
              <OptionButton label="1080p" active={resolution === "1080p"} onClick={() => onResolutionChange("1080p")} />
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel>Tỷ lệ khung hình</FieldLabel>
            <SelectField
              value={selectedAspectRatioLabel}
              onChange={(value) => {
                const selected = aspectRatioOptions.find((opt) => opt.label === value);
                if (selected) onAspectRatioChange(selected.ratio);
              }}
              options={aspectRatioOptions.map((opt) => opt.label)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <FieldLabel>Thời lượng</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {DURATION_PRESETS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handlePresetDurationClick(opt.value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  !isCustomDuration && durationSeconds === opt.value
                    ? "border-[#0db461] bg-[#dff6ea] text-[#16633f] shadow-[0_4px_10px_rgba(13,180,97,0.2)]"
                    : "border-[#c9e5d5] bg-[#f0f7f3] text-[#3f6f5a] hover:border-[#9fdab9]"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setIsCustomDuration(true);
                setCustomDurationInput("");
              }}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isCustomDuration
                  ? "border-[#0db461] bg-[#dff6ea] text-[#16633f] shadow-[0_4px_10px_rgba(13,180,97,0.2)]"
                  : "border-[#c9e5d5] bg-[#f0f7f3] text-[#3f6f5a] hover:border-[#9fdab9]"
              }`}
            >
              Khác
            </button>
          </div>

          {isCustomDuration && (
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={5}
                max={600}
                placeholder="Nhập số giây (5-600)"
                value={customDurationInput}
                onChange={(e) => handleCustomDurationChange(e.target.value)}
                className="h-11 w-48 rounded-xl border border-[#9edfb9] bg-[#e6f5eb] px-4 text-sm text-[#1e4f3c] outline-none transition focus:border-[#11b861] focus:ring-2 focus:ring-[#11b861]/20 placeholder:text-[#7aa48f]"
                autoFocus
              />
              <span className="text-sm text-[#5f8e78]">giây</span>
              {customDurationInput && parseInt(customDurationInput, 10) >= 5 && (
                <span className="text-xs font-semibold text-[#0db461]">
                  = {parseInt(customDurationInput, 10) >= 60
                    ? `${Math.floor(parseInt(customDurationInput, 10) / 60)}p${parseInt(customDurationInput, 10) % 60 > 0 ? `${parseInt(customDurationInput, 10) % 60}s` : ""}`
                    : `${customDurationInput}s`}
                </span>
              )}
            </div>
          )}

          {multiClipHint && (
            <p className="text-[11px] leading-relaxed text-[#5b8a72]">{multiClipHint}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
