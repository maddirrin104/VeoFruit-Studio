"use client";

import { useState } from "react";
import { Check, Copy, FileVideo } from "lucide-react";
import { Card } from "@/components/ui/Card";

import type { ImageAngle } from "@/types/studio";

type ProductionBriefProps = {
  script: string;
  storyTopic: string;
  characterDescription: string;
  sceneLocation: string;
  aiModel: string;
  resolution: string;
  aspectRatio: string;
  durationSeconds: number;
  emotionStyle: string;
  visualStyle: string;
  motionIntensity: number;
  transitionEnabled: boolean;
  audioEnabled: boolean;
  voiceType: string;
  language: string;
  readSpeed: number;
  outputFormat: string;
  bgMusicEnabled: boolean;
  contentTone: string;
  videoGenre: string;
  numberOfScenes: number;
  imageAngle?: ImageAngle;
};

function modelLabel(aiModel: string): string {
  const map: Record<string, string> = {
    gen4_turbo: "Runway Gen4 Turbo (Image-to-Video)",
    "gen4.5": "Runway Gen4.5 (Text + Image)",
    "veo-3.1-fast": "Google Veo 3.1 Fast",
    "veo-3.0": "Google Veo 3.0",
    "kling-v2.6": "Kling v2.6",
    "kling-v1.6": "Kling v1.6",
  };
  return map[aiModel] ?? aiModel;
}

function aspectLabel(ratio: string): string {
  const map: Record<string, string> = {
    "9:16": "9:16 · Dọc (1080×1920)",
    "16:9": "16:9 · Ngang (1920×1080)",
    "1:1": "1:1 · Vuông (1080×1080)",
    "4:5": "4:5 · Dọc (1080×1350)",
  };
  return map[ratio] ?? ratio;
}

function motionLabel(intensity: number): string {
  if (intensity < 33) return `Chậm (${intensity}%)`;
  if (intensity < 67) return `Trung bình (${intensity}%)`;
  return `Nhanh (${intensity}%)`;
}

// Extract only the spoken dialogue lines from the script (strips scene headings and camera descriptions)
function extractNarrationText(script: string): string {
  const lines = script.split("\n");
  const narrationLines: string[] = [];
  let inNarration = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { inNarration = false; continue; }
    if (/^(SCENE|CẢNH|CANH)\s+\d+/i.test(trimmed)) { inNarration = false; continue; }
    if (/^(Cảnh quay|Visual|Hình ảnh)\s*:/i.test(trimmed)) { inNarration = false; continue; }
    if (/^(Lời thoại|Voiceover|Thoại)\s*:/i.test(trimmed)) {
      inNarration = true;
      const afterColon = trimmed.replace(/^[^:]+:\s*/, "").trim();
      if (afterColon) narrationLines.push(afterColon);
      continue;
    }
    if (inNarration) narrationLines.push(trimmed);
  }

  return narrationLines.join(" ").replace(/\s+/g, " ").trim();
}

// Estimate FPT TTS audio duration in seconds for Vietnamese text.
// Calibrated: "Bạn đã biết bí mật của măng cụt?" = 34 chars ≈ 2s → ~17 chars/sec at medium speed.
function estimateAudioDurationSeconds(text: string, readSpeed: number): number {
  if (!text) return 0;
  const charsPerSec = 14 + (readSpeed / 100) * 6; // 14 chars/sec at 0%, 20 chars/sec at 100%
  return Math.round(text.length / charsPerSec);
}

function buildGen4TurboPreviewMotion(imageAngle: ImageAngle | undefined, charPart: string): string {
  const desc = charPart.length <= 45 ? charPart : "a professional female sales advisor";
  const characterLock = `${desc} — Vietnamese or East Asian female sales presenter. Standing upright, facing directly into camera, warm smile. NOT a worker, NOT crouching.`;
  let cameraMotion: string;
  switch (imageAngle) {
    case "diagonal":
      cameraMotion = "Camera zooms out along a gentle diagonal from the fruit display. She was already standing to the side, just outside the initial frame.";
      break;
    case "close_up":
      cameraMotion = "Camera zooms out from the close-up of the fruit to a natural eye-level composition. She was already standing beside the display, just outside the tight crop.";
      break;
    case "top_down":
      cameraMotion = "Camera tilts up from the overhead view of the fruit display to a natural eye-level angle. She was already standing upright behind the display, below the initial overhead view.";
      break;
    case "eye_level":
    default:
      cameraMotion = "Camera smoothly pulls back from the fruit display. She was already standing behind the display, just outside the initial frame.";
  }
  return `${characterLock} ${cameraMotion}`;
}

function buildPromptPreview(props: ProductionBriefProps): string {
  const {
    aiModel,
    characterDescription,
    storyTopic,
    sceneLocation,
    visualStyle,
    emotionStyle,
    motionIntensity,
    contentTone,
    script,
    imageAngle,
  } = props;

  const charPart = characterDescription.trim() || "A professional presenter";
  const productRef = storyTopic.trim() || "the featured product";
  const setting = sceneLocation.trim() ? `Setting: ${sceneLocation}.` : "";

  const expressionDesc =
    contentTone.toLowerCase().includes("sang trọng") || contentTone.toLowerCase().includes("luxury")
      ? "elegant, confident presentation"
      : contentTone.toLowerCase().includes("vui")
      ? "upbeat, smiling expressions"
      : emotionStyle.trim() || "smiling, welcoming expressions";

  if (aiModel === "gen4_turbo") {
    const styleShort = (visualStyle || "Cinematic") + " style, 4K.";
    const cameraMotion = buildGen4TurboPreviewMotion(imageAngle, charPart);
    return [
      cameraMotion,
      "Pointing at fruits while speaking to camera — no picking up, touching, or moving fruits.",
      "CRITICAL: Fruits from reference image stay whole, untouched, in exact original positions.",
      "Character was already present — camera motion only, no materializing or phasing.",
      "Eye-level medium shot.",
      `Product: ${productRef}.`,
      setting,
      styleShort,
      `${expressionDesc}.`,
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const scriptExcerpt = script.replace(/\s+/g, " ").trim().slice(0, 120).replace(/[.!?]\s*$/, "");
  const motionDesc =
    motionIntensity < 33
      ? "Slow, elegant movements. Stable framing."
      : motionIntensity < 67
      ? "Natural movements. Gentle push-in."
      : "Dynamic movements. Quick cuts, vivid colors.";

  return [
    `${charPart}.`,
    `Enthusiastically introducing ${productRef} from the reference image, making natural eye contact with camera.`,
    scriptExcerpt ? `${scriptExcerpt}.` : "",
    setting,
    `${visualStyle || "Cinematic"} style, professional 4K lighting. Stable shot, locked geometry.`,
    motionDesc,
    `Bright warm lighting, ${expressionDesc}.`,
    "Product prominently centered. Reveal shot from food close-up to presenter with dish.",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCopyText(props: ProductionBriefProps): string {
  const {
    aiModel,
    resolution,
    aspectRatio,
    durationSeconds,
    emotionStyle,
    visualStyle,
    motionIntensity,
    transitionEnabled,
    audioEnabled,
    voiceType,
    language,
    readSpeed,
    outputFormat,
    bgMusicEnabled,
    contentTone,
    videoGenre,
    numberOfScenes,
    storyTopic,
    script,
  } = props;

  const speedLabel = readSpeed < 40 ? "Chậm" : readSpeed > 60 ? "Nhanh" : "Chuẩn";

  const lines = [
    "╔══════════════════════════════════════╗",
    "      PRODUCTION DRAFT — VeoFruit Studio",
    "╚══════════════════════════════════════╝",
    "",
    "▸ CHỦ ĐỀ",
    `  ${storyTopic || "(chưa nhập)"}`,
    "",
    "▸ THÔNG SỐ VIDEO",
    `  Model    : ${modelLabel(aiModel)}`,
    `  Thể loại : ${videoGenre}  |  Tông : ${contentTone}`,
    `  Số cảnh  : ${numberOfScenes}  |  Thời lượng : ${durationSeconds}s`,
    `  Tỉ lệ    : ${aspectLabel(aspectRatio)}`,
    `  Chất lượng: ${resolution}`,
    `  Hình ảnh : ${visualStyle}  |  Emotion : ${emotionStyle}`,
    `  Chuyển động: ${motionLabel(motionIntensity)}${transitionEnabled ? "  |  Transition: Bật" : "  |  Transition: Tắt"}`,
    "",
    "▸ THÔNG SỐ ÂM THANH",
    audioEnabled
      ? `  Giọng : ${voiceType}  |  Ngôn ngữ : ${language}`
      : "  Không có âm thanh (đã tắt)",
    audioEnabled ? `  Tốc độ : ${speedLabel} (${readSpeed}%)  |  Format : ${outputFormat.toUpperCase()}` : "",
    audioEnabled ? `  Nhạc nền : ${bgMusicEnabled ? "Bật" : "Tắt"}` : "",
    "",
    "▸ KỊCH BẢN AI",
    "  " + (script.trim() || "(chưa tạo kịch bản)").split("\n").join("\n  "),
    "",
    "▸ PROMPT GỢI Ý (dán vào Runway / Veo3)",
    "  " + buildPromptPreview(props),
    "",
    "══════════════════════════════════════════",
  ];

  return lines.join("\n");
}

export function ProductionBriefSection(props: ProductionBriefProps) {
  const { script } = props;
  const [copied, setCopied] = useState(false);

  if (!script.trim()) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildCopyText(props));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  const promptPreview = buildPromptPreview(props);
  const speedLabel = props.readSpeed < 40 ? "Chậm" : props.readSpeed > 60 ? "Nhanh" : "Chuẩn";
  const narrationText = extractNarrationText(script);
  const estimatedAudioSec = estimateAudioDurationSeconds(narrationText, props.readSpeed);
  const videoDurationSec = props.durationSeconds;
  const audioDiff = estimatedAudioSec - videoDurationSec;
  const audioFit = audioDiff <= 0 ? "ok" : audioDiff <= 5 ? "warn" : "over";

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#d6efdf] bg-[#f0faf5] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#0db461]/10">
            <FileVideo className="size-4 text-[#0db461]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1a5c38]">Production Draft</p>
            <p className="text-xs text-[#5c9474]">Kịch bản + thông số — sẵn sàng gửi đến Runway / Veo3</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#a5ddb9] bg-white px-4 text-xs font-semibold text-[#1a5c38] transition hover:border-[#0fa45a] hover:bg-[#e8f8f1]"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-[#0db461]" />
              Đã sao chép
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy tất cả
            </>
          )}
        </button>
      </div>

      <div className="divide-y divide-[#e8f4ee] p-5">
        {/* Parameters grid */}
        <div className="pb-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#3a7a56]">
            Thông số sản xuất
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <Param label="Model" value={modelLabel(props.aiModel)} wide />
            <Param label="Thể loại" value={props.videoGenre} />
            <Param label="Tông nội dung" value={props.contentTone} />
            <Param label="Số cảnh" value={String(props.numberOfScenes)} />
            <Param label="Thời lượng" value={`${props.durationSeconds}s`} />
            <Param label="Tỉ lệ khung hình" value={aspectLabel(props.aspectRatio)} />
            <Param label="Chất lượng" value={props.resolution} />
            <Param label="Phong cách hình ảnh" value={props.visualStyle} />
            <Param label="Cảm xúc hình ảnh" value={props.emotionStyle} />
            <Param label="Cường độ chuyển động" value={motionLabel(props.motionIntensity)} />
            <Param label="Chuyển cảnh" value={props.transitionEnabled ? "Bật" : "Tắt"} />
            <Param label="Âm thanh" value={props.audioEnabled ? "Có âm thanh" : "Không có âm thanh"} />
            {props.audioEnabled && (
              <>
                <Param label="Giọng đọc" value={`${props.voiceType} · ${props.language}`} />
                <Param label="Tốc độ đọc" value={`${speedLabel} (${props.readSpeed}%)`} />
                <Param label="Format âm thanh" value={props.outputFormat.toUpperCase()} />
                <Param label="Nhạc nền" value={props.bgMusicEnabled ? "Bật" : "Tắt"} />
              </>
            )}
          </div>
        </div>

        {/* Script */}
        <div className="py-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#3a7a56]">
            Kịch bản AI
          </p>
          <pre className="whitespace-pre-wrap rounded-xl border border-[#d6efdf] bg-[#f8fdfb] p-4 font-sans text-sm leading-relaxed text-[#1e3d2b]">
            {script.trim()}
          </pre>
        </div>

        {/* Prompt preview */}
        <div className="py-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#3a7a56]">
            Prompt xem trước (ước tính)
          </p>
          <p className="mb-1 text-xs text-[#6e9a86]">
            {props.aiModel === "gen4_turbo"
              ? "Cấu trúc prompt tương tự sẽ được gửi đến Gen4 Turbo."
              : props.aiModel === "gen4.5"
              ? "Prompt thực gửi đến Gen4.5 chi tiết hơn (~800–1000 ký tự) với nhiều hướng dẫn bổ sung về màu sắc, chuyển động và nhân vật."
              : "Cấu trúc prompt tương tự sẽ được gửi đến AI. Prompt thực có thể dài và chi tiết hơn."}
          </p>
          <p className="mb-3 text-xs font-medium text-amber-600">
            ⚠ Nội dung tiếng Việt (mô tả nhân vật, kịch bản, địa điểm…) sẽ được hệ thống tự động dịch sang tiếng Anh trước khi gửi đến Runway. Prompt thực gửi đi là toàn bộ tiếng Anh.
          </p>
          <div className="relative">
            <pre className="whitespace-pre-wrap rounded-xl border border-[#c5e8d5] bg-[#edf9f3] p-4 font-mono text-xs leading-relaxed text-[#1a5c38]">
              {promptPreview}
            </pre>
            <CopyButton text={promptPreview} className="absolute right-2 top-2" />
          </div>
          <p className="mt-2 text-xs text-[#8aa495]">
            Xem trước: {promptPreview.length} ký tự · Sau khi dịch sang Anh, prompt thực gửi Runway có thể dài hơn (tối đa 1000 ký tự)
          </p>
        </div>

        {/* FPT Narration Draft — after prompt preview */}
        {props.audioEnabled && narrationText && (
          <div className="pt-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#3a7a56]">
              FPT Narration Draft
            </p>
            <p className="mb-3 text-xs text-[#6e9a86]">
              Văn bản lời thoại sẽ được đọc bởi FPT TTS. Dán đoạn này vào FPT để kiểm tra độ khớp với thời lượng video.
            </p>
            <div className="relative">
              <pre className="whitespace-pre-wrap rounded-xl border border-[#d6efdf] bg-[#f8fdfb] p-4 pr-16 font-sans text-sm leading-relaxed text-[#1e3d2b]">
                {narrationText}
              </pre>
              <CopyButton text={narrationText} className="absolute right-2 top-2" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-xs text-[#8aa495]">
                {narrationText.length} ký tự · ước tính ~{estimatedAudioSec}s audio
              </span>
              <span className="text-xs text-[#8aa495]">·</span>
              <span className="text-xs text-[#8aa495]">Video: {videoDurationSec}s</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  audioFit === "ok"
                    ? "bg-[#d4f4df] text-[#1a6b3f]"
                    : audioFit === "warn"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {audioFit === "ok"
                  ? "Khớp thời lượng"
                  : audioFit === "warn"
                  ? `Hơi dài (+${audioDiff}s — có thể cắt nhẹ)`
                  : `Quá dài (+${audioDiff}s — audio bị cắt)`}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function Param({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2 sm:col-span-3" : ""}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7aaa90]">{label}</p>
      <p className="font-semibold text-[#1e3d2b]">{value}</p>
    </div>
  );
}

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex h-7 items-center gap-1 rounded-lg border border-[#a5ddb9] bg-white/80 px-2 text-[11px] font-semibold text-[#1a5c38] backdrop-blur-sm transition hover:bg-white ${className ?? ""}`}
    >
      {copied ? <Check className="size-3 text-[#0db461]" /> : <Copy className="size-3" />}
      {copied ? "Đã copy" : "Copy"}
    </button>
  );
}
