"use client";

import { useState } from "react";
import {
  Music,
  Palette,
  Play,
  RefreshCw,
  Volume2,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  RangeField,
  SelectField,
  TextInput,
} from "@/components/ui/FormControls";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { getVoiceLabel, VOICE_DEFINITIONS, type VoiceType } from "@/lib/voice-options";
import { parseVoiceLabel } from "@/lib/voice-parsing";

const EMOTION_PRESETS = [
  "Vật tươi",
  "Năng lượng",
  "Sang trọng",
  "Tự nhiên",
  "Ấm áp",
  "Vui nhộn",
  "Thanh lịch",
  "Tinh tế",
  "Truyền cảm hứng",
  "Thân thiện",
  "Mộc mạc",
  "Sôi động",
  "Yên bình",
  "Cao cấp",
  "Tươi mát mùa hè",
];

const VISUAL_PRESETS = [
  "Cinematic",
  "Realistic",
  "Dreamy",
  "Lifestyle",
  "Documentary",
  "Commercial",
  "Minimalist",
  "Vintage Film",
  "Food Photography",
  "Ultra Macro",
  "Studio Lighting",
  "Street Market",
  "Natural Light",
  "Moody",
  "Color Pop",
  "Soft Pastel",
];

const VISUAL_PRESET_LABELS: Record<string, string> = {
  "Cinematic": "Cinematic - Điện ảnh",
  "Realistic": "Realistic - Chân thực",
  "Dreamy": "Dreamy - Mơ màng",
  "Lifestyle": "Lifestyle - Đời sống",
  "Documentary": "Documentary - Tài liệu",
  "Commercial": "Commercial - Quảng cáo",
  "Minimalist": "Minimalist - Tối giản",
  "Vintage Film": "Vintage Film - Phim cổ điển",
  "Food Photography": "Food Photography - Nhiếp ảnh ẩm thực",
  "Ultra Macro": "Ultra Macro - Cận siêu chi tiết",
  "Studio Lighting": "Studio Lighting - Ánh sáng studio",
  "Street Market": "Street Market - Chợ đường phố",
  "Natural Light": "Natural Light - Ánh sáng tự nhiên",
  "Moody": "Moody - Tâm trạng",
  "Color Pop": "Color Pop - Màu sắc nổi bật",
  "Soft Pastel": "Soft Pastel - Màu pastel nhẹ",
};

type AiOptimizationSectionProps = {
  emotionStyle: string;
  visualStyle: string;
  motionIntensity: number;
  transitionEnabled: boolean;
  subjectConsistent: boolean;
  audioEnabled: boolean;
  narrationMode: "script_read_along" | "separate_voiceover";
  voiceType: VoiceType;
  language: string;
  readSpeed: number;
  emotionIntensity: number;
  outputFormat: "mp3" | "wav";
  bgMusicEnabled: boolean;
  isPreviewingVoice: boolean;
  previewVoiceUrl?: string;
  isGeneratingVideo: boolean;
  onEmotionStyleChange: (value: string) => void;
  onVisualStyleChange: (value: string) => void;
  onMotionIntensityChange: (value: number) => void;
  onTransitionEnabledChange: (value: boolean) => void;
  onSubjectConsistentChange: (value: boolean) => void;
  onAudioEnabledChange: (value: boolean) => void;
  onNarrationModeChange: (value: "script_read_along" | "separate_voiceover") => void;
  onVoiceTypeChange: (value: VoiceType) => void;
  onLanguageChange: (value: string) => void;
  onReadSpeedChange: (value: number) => void;
  onEmotionIntensityChange: (value: number) => void;
  onOutputFormatChange: (value: "mp3" | "wav") => void;
  onBgMusicEnabledChange: (value: boolean) => void;
  onPreviewVoice: (voiceType?: VoiceType) => void;
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
  audioEnabled,
  narrationMode,
  voiceType,
  language,
  readSpeed,
  emotionIntensity,
  outputFormat,
  bgMusicEnabled,
  isPreviewingVoice,
  previewVoiceUrl,
  isGeneratingVideo,
  onEmotionStyleChange,
  onVisualStyleChange,
  onMotionIntensityChange,
  onTransitionEnabledChange,
  onSubjectConsistentChange,
  onAudioEnabledChange,
  onNarrationModeChange,
  onVoiceTypeChange,
  onLanguageChange,
  onReadSpeedChange,
  onEmotionIntensityChange,
  onOutputFormatChange,
  onBgMusicEnabledChange,
  onPreviewVoice,
  onReset,
  onGenerateVideo,
}: AiOptimizationSectionProps) {
  // Cảm xúc - Khác
  const isCustomEmotion = !EMOTION_PRESETS.includes(emotionStyle);
  const [customEmotionInput, setCustomEmotionInput] = useState(isCustomEmotion ? emotionStyle : "");

  function handleEmotionSelectChange(value: string) {
    if (value === "__custom__") {
      setCustomEmotionInput("");
      onEmotionStyleChange("");
    } else {
      setCustomEmotionInput("");
      onEmotionStyleChange(value);
    }
  }

  // Phong cách - Khác
  const isCustomVisual = !VISUAL_PRESETS.includes(visualStyle);
  const [customVisualInput, setCustomVisualInput] = useState(isCustomVisual ? visualStyle : "");

  function handleVisualSelectChange(value: string) {
    if (value === "__custom__") {
      setCustomVisualInput("");
      onVisualStyleChange("");
    } else {
      setCustomVisualInput("");
      onVisualStyleChange(value);
    }
  }

  const emotionSelectValue = isCustomEmotion ? "__custom__" : emotionStyle;
  const visualSelectValue = isCustomVisual ? "__custom__" : (VISUAL_PRESET_LABELS[visualStyle] ? visualStyle : visualStyle);

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
                value={emotionSelectValue}
                onChange={handleEmotionSelectChange}
                options={[
                  ...EMOTION_PRESETS.map((e) => ({ label: e, value: e })),
                  { label: "Khác (tự nhập)...", value: "__custom__" },
                ]}
              />
              {isCustomEmotion && (
                <TextInput
                  placeholder="VD: Trang trọng lễ hội, Mùa hè rực rỡ..."
                  value={customEmotionInput}
                  autoFocus
                  onChange={(e) => {
                    setCustomEmotionInput(e.target.value);
                    onEmotionStyleChange(e.target.value);
                  }}
                />
              )}
            </div>

            <div className="space-y-2">
              <FieldLabel>Phong cách</FieldLabel>
              <SelectField
                value={isCustomVisual ? "__custom__" : visualStyle}
                onChange={handleVisualSelectChange}
                options={[
                  ...VISUAL_PRESETS.map((v) => ({
                    label: VISUAL_PRESET_LABELS[v] ?? v,
                    value: v,
                  })),
                  { label: "Khác (tự nhập)...", value: "__custom__" },
                ]}
              />
              {isCustomVisual && (
                <TextInput
                  placeholder="VD: Anime style, Watercolor, Flat design..."
                  value={customVisualInput}
                  autoFocus
                  onChange={(e) => {
                    setCustomVisualInput(e.target.value);
                    onVisualStyleChange(e.target.value);
                  }}
                />
              )}
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
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d4f4df] text-[#0eaf5f]">
                <Volume2 className="size-4" />
              </span>
              <h2 className="whitespace-nowrap font-[family:var(--font-sora)] text-base font-semibold tracking-tight text-[#0d9d56]">
                Âm thanh & thuyết minh
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#2f7056]">
                {audioEnabled ? "Có âm thanh" : "Không âm thanh"}
              </span>
              <ToggleSwitch
                checked={audioEnabled}
                onClick={() => onAudioEnabledChange(!audioEnabled)}
              />
            </div>
          </div>

          {!audioEnabled && (
            <p className="rounded-xl border border-dashed border-[#c5dfd0] bg-[#f3faf6] px-4 py-3 text-sm text-[#5c9474]">
              Video sẽ được tạo không có âm thanh / giọng đọc. Bật lại để cấu hình giọng đọc và nhạc nền.
            </p>
          )}

          <div className={`space-y-5 ${audioEnabled ? "" : "pointer-events-none mt-4 opacity-30"}`}>
            <div className="space-y-2">
              <FieldLabel>Chế độ lồng tiếng</FieldLabel>
              <SelectField
                value={narrationMode}
                onChange={(value) =>
                  onNarrationModeChange(value as "script_read_along" | "separate_voiceover")
                }
                options={[
                  {
                    label: "Đọc theo kịch bản (không tạo voice-over riêng)",
                    value: "script_read_along",
                  },
                  {
                    label: "Lồng tiếng riêng (AI âm thanh riêng)",
                    value: "separate_voiceover",
                  },
                ]}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Kiểu giọng</FieldLabel>
              <div className="space-y-3 rounded-xl border border-[#b8e4cb] bg-[#edf8f2] p-3">
                <div className="flex items-center justify-between gap-2 rounded-lg border border-[#c7e8d4] bg-white/70 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#51866e]">
                    Đang chọn
                  </p>
                  <p className="text-sm font-semibold text-[#0f8f4e]">{getVoiceLabel(voiceType)}</p>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  {VOICE_DEFINITIONS.map((voice, index) => {
                    const active = voiceType === voice.id;
                    const isLastOddItem =
                      VOICE_DEFINITIONS.length % 2 === 1 && index === VOICE_DEFINITIONS.length - 1;

                    return (
                      <div
                        key={voice.id}
                        onDoubleClick={isPreviewingVoice ? undefined : () => onPreviewVoice(voice.id)}
                        className={`flex min-h-11 items-center justify-between rounded-xl border px-3 py-2 ${
                          active
                            ? "border-[#0db461] bg-[#ecf9f2]"
                            : "border-[#b8e4cb] bg-white"
                        } ${isLastOddItem ? "md:col-span-2 md:mx-auto md:w-[70%]" : ""}`}
                      >
                        <button
                          type="button"
                          onClick={() => onVoiceTypeChange(voice.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                            <div className="space-y-0.5">
                              <p
                                className={`text-sm font-semibold leading-tight ${
                                  active ? "text-[#0f8f4e]" : "text-[#2f7056]"
                                }`}
                              >
                                {parseVoiceLabel(voice.label).name}
                              </p>
                              <p
                                className={`text-xs leading-tight ${
                                  active ? "text-[#10b862]" : "text-[#5f8f79]"
                                }`}
                              >
                                {parseVoiceLabel(voice.label).region}
                              </p>
                            </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => onPreviewVoice(voice.id)}
                          disabled={isPreviewingVoice}
                          className="ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#8fd2ad] bg-white text-[#2a7a55] transition hover:border-[#66c091] disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Nghe thử giọng ${voice.label}`}
                        >
                          <Play className="ml-0.5 size-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {isPreviewingVoice ? (
                  <p className="text-xs font-medium text-[#2a7a55]">Đang tạo mẫu giọng...</p>
                ) : null}

                {previewVoiceUrl ? (
                  <div className="rounded-xl border border-[#b8e4cb] bg-white p-2">
                    <audio
                      key={previewVoiceUrl}
                      controls
                      src={previewVoiceUrl}
                      className="w-full"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 md:p-7">
        <SectionHeading
          title="Tinh chỉnh giọng đọc"
          icon={<Volume2 className="size-5" />}
        />

        <div className="space-y-5">
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

          <div className="space-y-2">
            <FieldLabel>Cảm xúc giọng đọc</FieldLabel>
            <RangeField
              value={emotionIntensity}
              onChange={onEmotionIntensityChange}
              minLabel="Điềm tĩnh"
              maxLabel="Biểu cảm"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Định dạng xuất audio</FieldLabel>
            <SelectField
              value={outputFormat}
              onChange={(value) => onOutputFormatChange(value as "mp3" | "wav")}
              options={[
                { label: "MP3 - Nhẹ, tương thích cao", value: "mp3" },
                { label: "WAV - Chất lượng cao", value: "wav" },
              ]}
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
