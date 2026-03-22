"use client";

import {
  Music,
  Palette,
  RefreshCw,
  Volume2,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  RangeField,
  SelectField,
} from "@/components/ui/FormControls";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

type AiOptimizationSectionProps = {
  emotionStyle: string;
  visualStyle: string;
  motionIntensity: number;
  transitionEnabled: boolean;
  subjectConsistent: boolean;
  voiceType: "Nam" | "Nữ" | "Trung tính AI";
  language: string;
  readSpeed: number;
  bgMusicEnabled: boolean;
  isGeneratingVideo: boolean;
  onEmotionStyleChange: (value: string) => void;
  onVisualStyleChange: (value: string) => void;
  onMotionIntensityChange: (value: number) => void;
  onTransitionEnabledChange: (value: boolean) => void;
  onSubjectConsistentChange: (value: boolean) => void;
  onVoiceTypeChange: (value: "Nam" | "Nữ" | "Trung tính AI") => void;
  onLanguageChange: (value: string) => void;
  onReadSpeedChange: (value: number) => void;
  onBgMusicEnabledChange: (value: boolean) => void;
  onReset: () => void;
  onGenerateVideo: () => void;
};

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="relative pl-2 text-[13px] font-semibold uppercase tracking-wide text-[#2f7056] before:absolute before:left-0 before:top-1 before:h-4 before:w-0.75 before:rounded-full before:bg-[#10b862]">
      {children}
    </p>
  );
}

export function AiOptimizationSection({
  emotionStyle,
  visualStyle,
  motionIntensity,
  transitionEnabled,
  subjectConsistent,
  voiceType,
  language,
  readSpeed,
  bgMusicEnabled,
  isGeneratingVideo,
  onEmotionStyleChange,
  onVisualStyleChange,
  onMotionIntensityChange,
  onTransitionEnabledChange,
  onSubjectConsistentChange,
  onVoiceTypeChange,
  onLanguageChange,
  onReadSpeedChange,
  onBgMusicEnabledChange,
  onReset,
  onGenerateVideo,
}: AiOptimizationSectionProps) {

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 md:p-7">
          <SectionHeading
            title="Hình ảnh & chuyển động"
            icon={<Palette className="size-5" />}
          />

          <div className="space-y-5">
            <div className="space-y-2">
              <FieldLabel>Cảm xúc</FieldLabel>
              <SelectField
                value={emotionStyle}
                onChange={onEmotionStyleChange}
                options={["Vật tươi", "Năng lượng", "Sang trọng", "Tự nhiên"]}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Phong cách</FieldLabel>
              <SelectField
                value={visualStyle}
                onChange={onVisualStyleChange}
                options={["Cinematic", "Realistic", "Dreamy", "Lifestyle"]}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Cường độ chuyển động</FieldLabel>
              <RangeField
                value={motionIntensity}
                onChange={onMotionIntensityChange}
                minLabel="Nhẹ (0.5x)"
                maxLabel="Mạnh (1.5x)"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Nhất quán chủ thể</FieldLabel>
              <div className="rounded-xl border border-[#b8e4cb] bg-[#edf8f2] px-3 py-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between rounded-lg px-1 text-sm font-semibold text-[#2f7056]">
                    <span>Chuyển cảnh</span>
                    <ToggleSwitch 
                      checked={transitionEnabled} 
                      onClick={() => onTransitionEnabledChange(!transitionEnabled)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg px-1 text-sm font-semibold text-[#2f7056]">
                    <span>Nhất quán chủ thể</span>
                    <ToggleSwitch 
                      checked={subjectConsistent} 
                      onClick={() => onSubjectConsistentChange(!subjectConsistent)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <SectionHeading
            title="Âm thanh & thuyết minh"
            icon={<Volume2 className="size-5" />}
          />

          <div className="space-y-5">
            <div className="space-y-2">
              <FieldLabel>Kiểu giọng</FieldLabel>
              <SelectField
                value={voiceType}
                onChange={(value) => onVoiceTypeChange(value as "Nam" | "Nữ" | "Trung tính AI")}
                options={["Nam", "Nữ", "Trung tính AI"]}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Ngôn ngữ</FieldLabel>
              <SelectField
                value={language}
                onChange={onLanguageChange}
                options={["Tiếng Việt", "English", "한국어", "日本語"]}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Tốc độ đọc</FieldLabel>
              <RangeField
                value={readSpeed}
                onChange={onReadSpeedChange}
                minLabel="Chậm (0.5x)"
                maxLabel="Nhanh (1.5x)"
              />
            </div>

            <div className="rounded-xl border border-[#b8e4cb] bg-[#edf8f2] px-3 py-2.5">
              <div className="flex w-full items-center justify-between rounded-lg px-1 text-sm font-semibold text-[#2f7056]">
                <span className="inline-flex items-center gap-2">
                  <Music className="size-4" />
                  Nhạc nền
                </span>
                <ToggleSwitch 
                  checked={bgMusicEnabled} 
                  onClick={() => onBgMusicEnabledChange(!bgMusicEnabled)}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#c5ddcf] bg-white px-4 text-sm font-semibold text-[#446f5b] shadow-[0_8px_20px_rgba(28,78,53,0.08)] transition hover:border-[#9edfb9]"
          >
            <RefreshCw className="size-4" />
            Làm lại
          </button>

          <button
            type="button"
            onClick={onGenerateVideo}
            disabled={isGeneratingVideo}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0db461] px-7 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(13,180,97,0.35)] transition hover:bg-[#0aa757]"
          >
            <Zap className="size-4" />
            {isGeneratingVideo ? "Đang tạo..." : "Tạo video AI"}
          </button>
        </div>
      </Card>
    </div>
  );
}
