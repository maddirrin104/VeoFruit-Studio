"use client";

import { Clapperboard, FileText, Sparkles, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { WorkflowMode } from "@/types/studio";

type WorkflowOption = {
  mode: WorkflowMode;
  title: string;
  description: string;
  tags: string[];
  icon: React.ReactNode;
  badge?: string;
};

const WORKFLOW_OPTIONS: WorkflowOption[] = [
  {
    mode: "runway-manual",
    title: "Runway + Kịch bản thủ công",
    description: "Dán kịch bản có sẵn từ bên ngoài, RunwayML tạo video và FPT tạo giọng đọc.",
    tags: ["Runway Gen4.5", "Kịch bản tự dán", "FPT Voice"],
    icon: <FileText className="size-5" />,
  },
  {
    mode: "runway-ai-script",
    title: "Runway + AI tạo kịch bản",
    description: "Google Gemini tự sinh kịch bản từ chủ đề, RunwayML tạo video và FPT tạo giọng đọc.",
    tags: ["Runway Gen4.5", "Gemini Script", "FPT Voice"],
    icon: <Sparkles className="size-5" />,
    badge: "Phổ biến",
  },
  {
    mode: "veo3-direct",
    title: "Google Veo3 trực tiếp",
    description: "Tạo video qua Google Veo3 (không qua Runway), Gemini sinh kịch bản, FPT tạo giọng đọc.",
    tags: ["Google Veo3", "Gemini Script", "FPT Voice"],
    icon: <Clapperboard className="size-5" />,
    badge: "Mới",
  },
  {
    mode: "kling-ai-script",
    title: "Kling AI + AI tạo kịch bản",
    description: "Kling AI V2.6 tạo video chất lượng cao, Gemini sinh kịch bản, FPT tạo giọng đọc.",
    tags: ["Kling V2.6", "Gemini Script", "FPT Voice"],
    icon: <Zap className="size-5" />,
  },
];

type WorkflowModeSectionProps = {
  workflowMode: WorkflowMode;
  onChange: (mode: WorkflowMode) => void;
};

export function WorkflowModeSection({ workflowMode, onChange }: WorkflowModeSectionProps) {
  return (
    <Card className="p-6 md:p-7">
      <SectionHeading title="Chọn quy trình tạo video" icon={<Clapperboard className="size-5" />} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {WORKFLOW_OPTIONS.map((option) => {
          const isActive = workflowMode === option.mode;
          return (
            <button
              key={option.mode}
              type="button"
              onClick={() => onChange(option.mode)}
              className={`relative flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all ${
                isActive
                  ? "border-[#10b862] bg-[#edfaf3] shadow-[0_0_0_2px_rgba(16,184,98,0.18)]"
                  : "border-[#d0eadc] bg-[#f7fdf9] hover:border-[#9fdab9] hover:bg-[#f0faf5]"
              }`}
            >
              {option.badge ? (
                <span className="absolute right-3 top-3 rounded-full bg-[#10b862] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                  {option.badge}
                </span>
              ) : null}

              <div
                className={`flex size-9 items-center justify-center rounded-xl ${
                  isActive ? "bg-[#10b862] text-white" : "bg-[#e1f5ea] text-[#10b862]"
                }`}
              >
                {option.icon}
              </div>

              <div className="space-y-1 pr-10">
                <p className={`text-sm font-bold leading-snug ${isActive ? "text-[#0a7a3c]" : "text-[#1a4a34]"}`}>
                  {option.title}
                </p>
                <p className="text-xs leading-relaxed text-[#5a8a72]">{option.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {option.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      isActive
                        ? "bg-[#d0f4e2] text-[#0a7a3c]"
                        : "bg-[#e8f6ef] text-[#3a7a5a]"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {isActive ? (
                <span className="absolute bottom-3 right-3 flex size-5 items-center justify-center rounded-full bg-[#10b862]">
                  <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-[#c8e9d8] bg-[#f3fbf7] px-4 py-3 text-xs text-[#3a7058]">
        {workflowMode === "runway-manual" && (
          <p><span className="font-semibold">Mode 1:</span> Dán kịch bản từ bên ngoài (ChatGPT, Gemini...) trực tiếp vào ô kịch bản. AI sẽ không tự sinh kịch bản — RunwayML Gen4.5 dùng kịch bản đó để tạo video. Cần: Runway API Key + FPT API Key.</p>
        )}
        {workflowMode === "runway-ai-script" && (
          <p><span className="font-semibold">Mode 2:</span> Nhập chủ đề, Google Gemini tự sinh kịch bản đa cảnh tiếng Việt. Sau đó RunwayML Gen4.5 tạo từng cảnh video và ghép lại. Cần: Google API Key + Runway API Key + FPT API Key.</p>
        )}
        {workflowMode === "veo3-direct" && (
          <p><span className="font-semibold">Mode 3:</span> Google Veo3 trực tiếp (không qua RunwayML). Gemini sinh kịch bản, Veo3 tạo video. Yêu cầu Google API key có quyền truy cập Veo3. Cần: Google API Key + FPT API Key.</p>
        )}
        {workflowMode === "kling-ai-script" && (
          <p><span className="font-semibold">Mode 4:</span> Kling AI V2.6 tạo video chất lượng cao với âm thanh tích hợp. Gemini sinh kịch bản đa cảnh, FPT tạo giọng đọc tiếng Việt. Cần: Google API Key + Kling Access Key + Kling Secret Key + FPT API Key.</p>
        )}
      </div>
    </Card>
  );
}
