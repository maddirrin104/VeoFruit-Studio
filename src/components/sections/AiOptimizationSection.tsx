"use client";

import { useState } from "react";
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

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="relative pl-2 text-[13px] font-semibold uppercase tracking-wide text-[#2f7056] before:absolute before:left-0 before:top-1 before:h-4 before:w-0.75 before:rounded-full before:bg-[#10b862]">
      {children}
    </p>
  );
}

export function AiOptimizationSection() {
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [subjectConsistent, setSubjectConsistent] = useState(true);
  const [bgMusicEnabled, setBgMusicEnabled] = useState(false);
  const emotionStyle = "Vật tươi";
  const visualStyle = "Cinematic";
  const voiceType = "Nam";
  const language = "Tiếng Việt";
  const motionIntensity = 50;
  const readSpeed = 50;

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
                defaultValue={emotionStyle}
                options={["Vật tươi", "Năng lượng", "Sang trọng", "Tự nhiên"]}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Phong cách</FieldLabel>
              <SelectField
                defaultValue={visualStyle}
                options={["Cinematic", "Realistic", "Dreamy", "Lifestyle"]}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Cường độ chuyển động</FieldLabel>
              <RangeField
                defaultValue={motionIntensity}
                minLabel="Nhẹ (0.5x)"
                maxLabel="Mạnh (1.5x)"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Nhất quán chủ thể</FieldLabel>
              <div className="rounded-xl border border-[#b8e4cb] bg-[#edf8f2] px-3 py-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTransitionEnabled((prev) => !prev)}
                    className="flex items-center justify-between rounded-lg px-1 text-sm font-semibold text-[#2f7056]"
                  >
                    <span>Chuyển cảnh</span>
                    <ToggleSwitch checked={transitionEnabled} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubjectConsistent((prev) => !prev)}
                    className="flex items-center justify-between rounded-lg px-1 text-sm font-semibold text-[#2f7056]"
                  >
                    <span>Nhất quán chủ thể</span>
                    <ToggleSwitch checked={subjectConsistent} />
                  </button>
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
                defaultValue={voiceType}
                options={["Nam", "Nữ", "Trung tính AI"]}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Ngôn ngữ</FieldLabel>
              <SelectField
                defaultValue={language}
                options={["Tiếng Việt", "English", "한국어", "日本語"]}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Tốc độ đọc</FieldLabel>
              <RangeField
                defaultValue={readSpeed}
                minLabel="Chậm (0.5x)"
                maxLabel="Nhanh (1.5x)"
              />
            </div>

            <div className="rounded-xl border border-[#b8e4cb] bg-[#edf8f2] px-3 py-2.5">
              <button
                type="button"
                onClick={() => setBgMusicEnabled((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg px-1 text-sm font-semibold text-[#2f7056]"
              >
                <span className="inline-flex items-center gap-2">
                  <Music className="size-4" />
                  Nhạc nền
                </span>
                <ToggleSwitch checked={bgMusicEnabled} />
              </button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#c5ddcf] bg-white px-4 text-sm font-semibold text-[#446f5b] shadow-[0_8px_20px_rgba(28,78,53,0.08)] transition hover:border-[#9edfb9]"
          >
            <RefreshCw className="size-4" />
            Làm lại
          </button>

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0db461] px-7 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(13,180,97,0.35)] transition hover:bg-[#0aa757]"
          >
            <Zap className="size-4" />
            Tạo video AI
          </button>
        </div>
      </Card>
    </div>
  );
}
