"use client";

import { Save } from "lucide-react";
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";

type DraftSectionProps = {
  isSaving: boolean;
  lastSavedLabel: string;
  onSaveDraft: () => void;
};

export function DraftSection({
  isSaving,
  lastSavedLabel,
  onSaveDraft,
}: DraftSectionProps) {
  const isMountedRef = useRef(false);

  const handleSaveDraft = () => {
    onSaveDraft();
  };

  useEffect(() => {
    isMountedRef.current = true;

    const timer = setInterval(() => {
      if (isMountedRef.current) {
        handleSaveDraft();
      }
    }, 300000); // Auto-save every 5 minutes

    return () => {
      clearInterval(timer);
      isMountedRef.current = false;
    };
  }, [onSaveDraft]);

  return (
    <Card className="p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <p className="text-[#6e9a86]">Nháp được lưu</p>
          <p className="font-semibold text-[#2f7056]">{lastSavedLabel || "Chưa lưu"}</p>
        </div>

        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#a5ddb9] bg-[#e8f8f1] px-6 text-sm font-semibold text-[#2f7056] transition-all duration-200 disabled:opacity-60 hover:border-[#0fa45a] hover:bg-[#dff5ec] hover:-translate-y-px"
        >
          {isSaving ? (
            <>
              <div className="size-4 animate-spin rounded-full border-2 border-[#2f7056] border-t-transparent" />
              Đang lưu...
            </>
          ) : (
            <>
                <Save className="size-4" />
              Lưu nháp ngay
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
