"use client";

import Image from "next/image";
import {
  Download,
  ImagePlus,
  Monitor,
  Play,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

type PreviewPanelProps = {
  resolution: string;
  aspectRatio: string;
  durationSeconds: number;
  voiceType: string;
  visualStyle: string;
  aiModel: string;
  sampleImageUrl?: string;
  sampleImageName?: string;
  onSampleImageChange: (file: File | null) => void;
  generationStatus?: "idle" | "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
  audioUrl?: string;
  generationId?: string;
};

export function PreviewPanel({
  resolution,
  aspectRatio,
  durationSeconds,
  voiceType,
  visualStyle,
  aiModel,
  sampleImageUrl,
  sampleImageName,
  onSampleImageChange,
  generationStatus = "idle",
  videoUrl,
  audioUrl,
  generationId,
}: PreviewPanelProps) {
  const canPreviewVideo = generationStatus === "completed" && Boolean(videoUrl);
  const canDownloadVideo =
    generationStatus === "completed" && Boolean(videoUrl) && Boolean(generationId);

  return (
    <div className="space-y-3 xl:sticky xl:top-5 xl:self-start">
      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <Monitor className="size-4 text-[#10b862]" />
          <h2 className="text-base font-semibold uppercase tracking-wide text-[#0fa45a]">
            Xem trước video
          </h2>
        </div>

        <div className="relative flex aspect-9/16 w-full items-center justify-center overflow-hidden rounded-xl border border-[#a7dfbe] bg-[linear-gradient(180deg,#d9f6e5_0%,#b9ebcf_100%)]">
          <span className="absolute right-3 top-3 rounded-full bg-[#effcf3] px-3 py-1 text-[11px] font-semibold text-[#10a95d] shadow-[0_6px_12px_rgba(23,96,60,0.14)]">
            {resolution} HD
          </span>

          {canPreviewVideo ? (
            <div className="h-full w-full bg-black">
              <video
                key={videoUrl}
                src={videoUrl}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              >
                Trình duyệt không hỗ trợ phát video.
              </video>
            </div>
          ) : (
            <div className="text-center">
              <div className="pulse-soft mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#05b25e] text-white shadow-[0_10px_22px_rgba(5,178,94,0.42)]">
                <Play className="ml-1 size-8" />
              </div>
              <p className="mt-4 text-sm text-[#39715a]">
                {generationStatus === "failed"
                  ? "Tạo video thất bại"
                  : generationStatus === "processing" || generationStatus === "pending"
                  ? "Đang tạo video..."
                  : "Chưa có preview"}
              </p>
            </div>
          )}
        </div>

        {canPreviewVideo ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-xs font-semibold text-[#0f8f4e] hover:underline"
            >
              Mở video ở tab mới
            </a>

            {canDownloadVideo ? (
              <a
                href={`/api/generations/${generationId}/download`}
                className="inline-flex items-center gap-1 rounded-lg border border-[#8ed0ad] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1b6e48] transition hover:border-[#67c193]"
              >
                <Download className="size-3.5" />
                Tải video
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-[#cdded4] bg-[#f1f5f2] px-2.5 py-1.5 text-xs font-semibold text-[#89a496]"
              >
                <Download className="size-3.5" />
                Tải video
              </button>
            )}
          </div>
        ) : null}

        {audioUrl ? (
          <div className="mt-3 rounded-xl border border-[#b4ddc5] bg-[#eff9f3] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#4a7e65]">
              Voice-over AI
            </p>
            <audio controls preload="none" className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              Trình duyệt không hỗ trợ phát âm thanh.
            </audio>
          </div>
        ) : null}

        <div className="mt-4 space-y-2 rounded-xl border border-dashed border-[#b4ddc5] bg-[#eff9f3] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#4a7e65]">
            Ảnh sản phẩm mẫu (tùy chọn)
          </p>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#8ed0ad] bg-white px-3 py-2 text-xs font-semibold text-[#1b6e48] transition hover:border-[#67c193]">
            <ImagePlus className="size-4" />
            Tải ảnh mẫu
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => onSampleImageChange(event.target.files?.[0] ?? null)}
            />
          </label>

          {sampleImageUrl ? (
            <div className="overflow-hidden rounded-lg border border-[#a8d8bc] bg-white">
              <Image
                src={sampleImageUrl}
                alt="Ảnh sản phẩm mẫu"
                width={400}
                height={160}
                unoptimized
                className="h-24 w-full object-cover"
              />
              <p className="truncate px-3 py-2 text-xs text-[#3f6f5a]">{sampleImageName}</p>
            </div>
          ) : (
            <p className="text-xs text-[#5f8f79]">Chưa chọn ảnh mẫu.</p>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#5f8f79]">
          Cấu hình hiện tại
        </p>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-[#d2ebdd] pb-2">
            <span className="text-[#5f8f79]">Model</span>
            <span className="font-semibold text-[#0ea75a]">{aiModel}</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#d2ebdd] pb-2">
            <span className="text-[#5f8f79]">Resolution</span>
            <span className="font-semibold text-[#0ea75a]">{resolution}</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#d2ebdd] pb-2">
            <span className="text-[#5f8f79]">Ratio</span>
            <span className="font-semibold text-[#0ea75a]">{aspectRatio}</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#d2ebdd] pb-2">
            <span className="text-[#5f8f79]">Duration</span>
            <span className="font-semibold text-[#0ea75a]">{durationSeconds}s</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#d2ebdd] pb-2">
            <span className="text-[#5f8f79]">Voice</span>
            <span className="font-semibold text-[#0ea75a]">{voiceType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5f8f79]">Style</span>
            <span className="font-semibold text-[#0ea75a]">{visualStyle}</span>
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