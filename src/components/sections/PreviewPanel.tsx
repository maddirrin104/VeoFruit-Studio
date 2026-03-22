"use client";

import { useMemo, useState } from "react";
import {
  Download,
  Eye,
  Play,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { sceneTimeline } from "@/lib/studio-data";

export function PreviewPanel() {
  const [selectedScene, setSelectedScene] = useState(
    sceneTimeline[0]?.label ?? "Scene 1"
  );
  const [hasPreview, setHasPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);

  const currentScene = useMemo(() => {
    return (
      sceneTimeline.find((scene) => scene.label === selectedScene) ??
      sceneTimeline[0]
    );
  }, [selectedScene]);

  const handleGeneratePreview = async () => {
    setIsGenerating(true);

    // Giả lập thời gian generate preview
    await new Promise((resolve) => setTimeout(resolve, 700));

    setHasPreview(true);
    setPreviewVersion((prev) => prev + 1);
    setIsGenerating(false);
  };

  const handleRegenerateScene = async () => {
    setIsGenerating(true);

    // Giả lập regenerate
    await new Promise((resolve) => setTimeout(resolve, 500));

    setHasPreview(true);
    setPreviewVersion((prev) => prev + 1);
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (!hasPreview) return;

    // Tạm thời chỉ mock hành vi download
    alert(`Downloading preview for ${selectedScene}...`);
  };

  return (
    <div className="xl:sticky xl:top-6">
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <h2 className="text-[22px] font-semibold tracking-tight text-white">
            Xem trước video
          </h2>
          <Eye className="size-5 text-fuchsia-400" />
        </div>

        <div className="flex aspect-[9/16] w-full items-center justify-center rounded-[24px] border border-fuchsia-500/20 bg-[linear-gradient(180deg,rgba(126,34,206,0.18),rgba(236,72,153,0.08))]">
          {!hasPreview ? (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300">
                <Play className="ml-1 size-8" />
              </div>
              <p className="mt-5 text-slate-400">No preview yet</p>
            </div>
          ) : (
            <div
              key={`${selectedScene}-${previewVersion}`}
              className="text-center"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-fuchsia-500/50 bg-fuchsia-500/15 text-3xl text-fuchsia-200 shadow-[0_0_30px_rgba(192,132,252,0.2)]">
                {currentScene?.icon ?? "🎬"}
              </div>

              <p className="mt-5 text-lg font-semibold text-white">
                {selectedScene}
              </p>

              <p className="mt-2 text-sm text-slate-300">
                Preview ready • Version {previewVersion}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm text-slate-400">Scene Timeline</p>

          <div className="grid grid-cols-4 gap-3">
            {sceneTimeline.map((scene) => {
              const isActive = selectedScene === scene.label;

              return (
                <button
                  key={scene.label}
                  type="button"
                  onClick={() => setSelectedScene(scene.label)}
                  className={`flex h-12 items-center justify-center rounded-xl border text-lg transition ${
                    isActive
                      ? "border-fuchsia-500/60 bg-fuchsia-500/15 text-white"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
                  }`}
                  title={scene.label}
                >
                  {scene.icon}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={handleGeneratePreview}
            disabled={isGenerating}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(168,85,247,0.35)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Play className="size-4" />
            {isGenerating ? "Generating..." : "Generate Preview"}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleRegenerateScene}
              disabled={isGenerating}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-medium text-slate-200 transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="size-4" />
              Regenerate Scene
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!hasPreview || isGenerating}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-medium text-slate-200 transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="size-4" />
              Download
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}