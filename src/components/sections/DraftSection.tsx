"use client";

import { PencilLine, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import type { ProjectRecord } from "@/services/studio-api";

type DraftSectionProps = {
  isSaving: boolean;
  lastSavedLabel: string;
  drafts: ProjectRecord[];
  currentDraftId: string | null;
  onSaveDraft: () => void;
  onLoadDraft: (projectId: string) => void;
  onRenameDraft: (projectId: string, newTitle: string) => void;
  onDeleteDraft: (projectId: string) => void;
};

export function DraftSection({
  isSaving,
  lastSavedLabel,
  drafts,
  currentDraftId,
  onSaveDraft,
  onLoadDraft,
  onRenameDraft,
  onDeleteDraft,
}: DraftSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [renamingDraftId, setRenamingDraftId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(false);

  const startRename = useCallback((draft: ProjectRecord) => {
    setRenamingDraftId(draft.id);
    setRenamingTitle(draft.title);
    setTimeout(() => renameInputRef.current?.select(), 0);
  }, []);

  const confirmRename = useCallback(() => {
    if (!renamingDraftId || !renamingTitle.trim()) return;
    onRenameDraft(renamingDraftId, renamingTitle.trim());
    setRenamingDraftId(null);
    setRenamingTitle("");
  }, [renamingDraftId, renamingTitle, onRenameDraft]);

  const cancelRename = useCallback(() => {
    setRenamingDraftId(null);
    setRenamingTitle("");
  }, []);

  const handleSaveDraft = useCallback(() => {
    onSaveDraft();
  }, [onSaveDraft]);

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
  }, [handleSaveDraft]);

  return (
    <Card className="p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <p className="text-[#6e9a86]">Nháp được lưu</p>
          <p className="font-semibold text-[#2f7056]">{lastSavedLabel || "Chưa lưu"}</p>
        </div>

        <div className="flex flex-wrap gap-2">
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
                Lưu nháp
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((current: boolean) => !current)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#cfe8d8] bg-white px-5 text-sm font-semibold text-[#2f7056] transition hover:border-[#9fdab9] hover:bg-[#f7fbf8]"
          >
            Danh sách nháp
            <span className="rounded-full bg-[#eff9f3] px-2 py-0.5 text-xs font-semibold text-[#2f7056]">
              {drafts.length}
            </span>
          </button>
        </div>
      </div>

      <div
        className={`mt-4 overflow-hidden rounded-2xl border border-[#d6efdf] bg-[#fbfefc] transition-all duration-300 ${
          isExpanded ? "max-h-225 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-b border-[#d6efdf] px-4 py-3">
          <p className="text-sm font-semibold text-[#2f7056]">Danh sách bản lưu</p>
          <p className="text-xs text-[#6e9a86]">Bấm vào một bản lưu để nạp lại, đổi tên hoặc xóa.</p>
        </div>

        <div className="space-y-2 p-4">
          {drafts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#cfe8d8] bg-white px-3 py-4 text-sm text-[#6e9a86]">
              Chưa có nháp nào. Bấm “Lưu nháp” để tạo bản đầu tiên.
            </p>
          ) : (
            drafts.map((draft) => {
              const isActive = draft.id === currentDraftId;
              const isRenaming = renamingDraftId === draft.id;
              return (
                <div
                  key={draft.id}
                  className={`rounded-xl border px-3 py-3 transition ${
                    isActive
                      ? "border-[#0fa45a] bg-[#eff9f3]"
                      : "border-[#d7eadf] bg-white hover:border-[#a9dcbc]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {isRenaming ? (
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <input
                          ref={renameInputRef}
                          type="text"
                          value={renamingTitle}
                          onChange={(e) => setRenamingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmRename();
                            if (e.key === "Escape") cancelRename();
                          }}
                          className="flex-1 rounded-lg border border-[#0fa45a] bg-white px-3 py-1.5 text-sm font-semibold text-[#204d38] outline-none focus:ring-2 focus:ring-[#0fa45a]/20"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={confirmRename}
                          className="shrink-0 rounded-lg bg-[#0db461] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0aa757]"
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={cancelRename}
                          className="shrink-0 rounded-lg border border-[#cfe8d8] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f7056] transition hover:bg-[#f0fbf5]"
                        >
                          Huỷ
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onLoadDraft(draft.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-semibold text-[#204d38]">
                          {draft.title}
                        </p>
                        <p className="text-xs text-[#6e9a86]">
                          {draft.storyTopic || "Chưa có chủ đề"} · {draft.videoGenre || "Chưa có thể loại"}
                        </p>
                        <p className="mt-1 text-[11px] text-[#8aa495]">
                          Cập nhật: {new Date(draft.updatedAt).toLocaleString("vi-VN")}
                        </p>
                      </button>
                    )}

                    {isActive && !isRenaming ? (
                      <span className="shrink-0 rounded-full bg-[#dff5ec] px-2.5 py-1 text-[11px] font-semibold text-[#1b7a50]">
                        Đang dùng
                      </span>
                    ) : null}
                  </div>

                  {!isRenaming && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onLoadDraft(draft.id)}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-[#9fdab9] bg-white px-3 text-xs font-semibold text-[#1f734d] transition hover:border-[#73c99d]"
                      >
                        Nạp nháp
                      </button>
                      <button
                        type="button"
                        onClick={() => startRename(draft)}
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[#cfe8d8] bg-[#f7fbf8] px-3 text-xs font-semibold text-[#2f7056] transition hover:border-[#9fdab9]"
                      >
                        <PencilLine className="size-3.5" />
                        Đổi tên
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteDraft(draft.id)}
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[#f2c2c2] bg-[#fff5f5] px-3 text-xs font-semibold text-[#b23b3b] transition hover:border-[#ea9f9f]"
                      >
                        <Trash2 className="size-3.5" />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
