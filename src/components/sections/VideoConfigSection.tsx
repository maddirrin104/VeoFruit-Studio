"use client";

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

const PROVIDER_INFO: Record<WorkflowMode, { label: string; model: string; note: string }> = {
  "runway-manual":    { label: "RunwayML",    model: "Gen 4.5",                    note: "Runway Gen-4.5 — clip tối đa 10 giây" },
  "runway-ai-script": { label: "RunwayML",    model: "Gen 4.5",                    note: "Runway Gen-4.5 — clip tối đa 10 giây" },
  "veo3-direct":      { label: "Google Veo3", model: "Veo 3.1 Generate Preview",   note: "Veo3 trực tiếp — cần Google API key có quyền Veo3" },
  "kling-ai-script":  { label: "Kling AI",    model: "Kling V2.6",                 note: "Kling V2.6 — hỗ trợ 5-10 giây mỗi clip" },
};

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
  const durationOptions: Array<{ label: string; value: number }> = [
    { label: "15s", value: 15 },
    { label: "30s", value: 30 },
    { label: "60s", value: 60 },
    { label: "90s", value: 90 },
    { label: "3p",  value: 180 },
  ];

  const clipsNeeded = durationSeconds > 10 ? Math.ceil(durationSeconds / 10) : 1;
  const multiClipHint =
    clipsNeeded > 1
      ? `Sẽ tạo ${clipsNeeded} clip 10s ghép thành video ${durationSeconds}s — khuyến nghị đặt số cảnh = ${clipsNeeded}.`
      : null;

  const selectedDurationLabel =
    durationOptions.find((opt) => opt.value === durationSeconds)?.label ??
    `${durationSeconds}s`;

  const aspectRatioOptions: Array<{ ratio: "9:16" | "1:1" | "16:9" | "4:5"; label: string }> = [
    { ratio: "9:16", label: "9:16 - TikTok, Reels, Shorts" },
    { ratio: "1:1",  label: "1:1 - Instagram Feed, Facebook Post" },
    { ratio: "16:9", label: "16:9 - YouTube, TV, Website" },
    { ratio: "4:5",  label: "4:5 - Instagram Feed (chiếm diện tích lớn)" },
  ];

  const selectedAspectRatioLabel =
    aspectRatioOptions.find((opt) => opt.ratio === aspectRatio)?.label ?? aspectRatio;

  const providerInfo = PROVIDER_INFO[workflowMode];

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
            <FieldLabel>Video Provider</FieldLabel>
            <div className="rounded-xl border border-[#a8dfbf] bg-[#eaf8f0] px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#12995a]">
                <span className="h-2 w-2 rounded-full bg-[#10b862]" />
                {providerInfo.label}
              </p>
              <p className="mt-0.5 text-xs font-medium text-[#30805a]">{providerInfo.model}</p>
              <p className="mt-0.5 text-xs text-[#6d9984]">{providerInfo.note}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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

          <div className="space-y-3">
            <FieldLabel>Thời lượng</FieldLabel>
            <SelectField
              value={selectedDurationLabel}
              onChange={(value) => {
                const selected = durationOptions.find((opt) => opt.label === value);
                if (selected) onDurationSecondsChange(selected.value);
              }}
              options={durationOptions.map((opt) => opt.label)}
            />
            {multiClipHint && (
              <p className="text-[11px] leading-relaxed text-[#5b8a72]">{multiClipHint}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
