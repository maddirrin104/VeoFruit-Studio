"use client";

import { useState } from "react";
import { Eye, EyeOff, Settings, X, ChevronDown, ChevronUp } from "lucide-react";
import type { RuntimeSettingsRecord } from "@/services/studio-api";
import type { WorkflowMode } from "@/types/studio";

type ApiConfigModalProps = {
  settings: RuntimeSettingsRecord;
  isLoading: boolean;
  isSaving: boolean;
  workflowMode: WorkflowMode;
  storagePath?: string;
  onChange: (partial: Partial<RuntimeSettingsRecord>) => void;
  onSave: () => void;
  onClose: () => void;
};

function PasswordField({
  label,
  value,
  placeholder,
  disabled,
  disabledNote,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  disabledNote?: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-[#1a4a34]">{label}</p>
      <div
        className={`flex items-center overflow-hidden rounded-xl border transition ${
          disabled
            ? "border-[#d8ead2] bg-[#f5fbf7] opacity-60"
            : "border-[#b8dfc8] bg-white focus-within:border-[#10b862] focus-within:ring-2 focus-within:ring-[#10b862]/15"
        }`}
      >
        <input
          type={show ? "text" : "password"}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-4 py-3 text-sm text-[#1a3d2b] outline-none placeholder:text-[#9bbdae] disabled:cursor-not-allowed"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShow((s) => !s)}
          className="px-3 py-3 text-[#6a9f87] transition hover:text-[#1a7a4a] disabled:cursor-not-allowed"
          aria-label={show ? "Ẩn" : "Hiển thị"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {disabled && disabledNote && (
        <p className="text-[11px] text-[#9bbdae]">{disabledNote}</p>
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-[#1a4a34]">{label}</p>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#b8dfc8] bg-white px-4 py-3 text-sm text-[#1a3d2b] outline-none placeholder:text-[#9bbdae] transition focus:border-[#10b862] focus:ring-2 focus:ring-[#10b862]/15"
      />
    </div>
  );
}

const API_USAGE: Record<WorkflowMode, { google: boolean; runway: boolean; fpt: boolean; kling: boolean }> = {
  "runway-manual":    { google: false, runway: true,  fpt: true, kling: false },
  "runway-ai-script": { google: true,  runway: true,  fpt: true, kling: false },
  "veo3-direct":      { google: true,  runway: false, fpt: true, kling: false },
  "kling-ai-script":  { google: true,  runway: false, fpt: true, kling: true  },
};

const MODE_LABELS: Record<WorkflowMode, string> = {
  "runway-manual":    "Mode 1 (Runway Manual)",
  "runway-ai-script": "Mode 2 (Runway AI)",
  "veo3-direct":      "Mode 3 (Veo3)",
  "kling-ai-script":  "Mode 4 (Kling AI)",
};

export function ApiConfigModal({
  settings,
  isLoading,
  isSaving,
  workflowMode,
  storagePath,
  onChange,
  onSave,
  onClose,
}: ApiConfigModalProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const usage = API_USAGE[workflowMode];
  const modeLabel = MODE_LABELS[workflowMode];

  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-[#0f2a1d]/35 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-2xl border border-[#b9e6ce] bg-white shadow-[0_24px_60px_rgba(14,50,30,0.28)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#daf0e5] bg-[#f3fbf7] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#20c06f] to-[#0cab5d] text-white shadow-[0_6px_14px_rgba(14,171,92,0.3)]">
              <Settings className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#0f2e1e]">Cấu hình API</h2>
              <p className="text-xs text-[#5a8a72]">Thiết lập mã API để bắt đầu tạo video</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-[#5a8a72] transition hover:bg-[#ddf5ea] hover:text-[#0f6e3a]"
            aria-label="Đóng"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-[#5a8a72]">Đang tải cấu hình...</p>
          ) : (
            <div className="space-y-4">
              <p className="rounded-lg bg-[#eaf7f0] px-3 py-2 text-xs text-[#2a7a52]">
                Đang dùng <span className="font-semibold">{modeLabel}</span> — chỉ các API được sử dụng trong mode này mới có thể chỉnh sửa.
              </p>

              <PasswordField
                label="Google Gemini API Key"
                value={settings.googleApiKey || ""}
                placeholder="Nhập mã API từ Google AI Studio..."
                disabled={!usage.google}
                disabledNote={`Không dùng trong ${modeLabel}`}
                onChange={(v) => onChange({ googleApiKey: v })}
              />

              <PasswordField
                label="RunwayML API Key"
                value={settings.runwayApiSecret || ""}
                placeholder="rw_..."
                disabled={!usage.runway}
                disabledNote={`Không dùng trong ${modeLabel}`}
                onChange={(v) => onChange({ runwayApiSecret: v })}
              />

              <PasswordField
                label="FPT AI API Key (TTS)"
                value={settings.fptApiKey || ""}
                placeholder="Nhập API Key từ FPT AI..."
                onChange={(v) => onChange({ fptApiKey: v })}
              />

              <div className="rounded-xl border border-[#d0eadc] bg-[#f7fdf9] p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${usage.kling ? "bg-[#10b862]" : "bg-[#c5d8cf]"}`} />
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#3a7058]">
                    Kling AI {!usage.kling && <span className="font-normal text-[#9bbdae]">— chỉ cần khi chọn Mode 4 (Kling)</span>}
                  </p>
                </div>

                <PasswordField
                  label="Kling AI Access Key"
                  value={settings.klingAccessKeyId || ""}
                  placeholder="Nhập Access Key từ Kling AI..."
                  disabled={!usage.kling}
                  disabledNote={`Không dùng trong ${modeLabel}`}
                  onChange={(v) => onChange({ klingAccessKeyId: v })}
                />

                <PasswordField
                  label="Kling AI Secret Key"
                  value={settings.klingAccessKeySecret || ""}
                  placeholder="Nhập Secret Key từ Kling AI..."
                  disabled={!usage.kling}
                  disabledNote="Lấy tại console.klingai.com"
                  onChange={(v) => onChange({ klingAccessKeySecret: v })}
                />
              </div>

              {/* Advanced toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced((s) => !s)}
                className="flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-xs font-semibold text-[#5a8a72] transition hover:text-[#1a7a4a]"
              >
                {showAdvanced ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                Cài đặt nâng cao
              </button>

              {showAdvanced && (
                <div className="space-y-4 rounded-xl border border-[#d8ead2] bg-[#f5fbf7] p-4">
                  <TextField
                    label="FPT TTS URL"
                    value={settings.fptTtsUrl}
                    placeholder="https://api.fpt.ai/hmi/tts/v5"
                    onChange={(v) => onChange({ fptTtsUrl: v })}
                  />
                  <TextField
                    label="Runway Base URL"
                    value={settings.runwayApiBaseUrl}
                    placeholder="https://api.dev.runwayml.com"
                    onChange={(v) => onChange({ runwayApiBaseUrl: v })}
                  />
                  <TextField
                    label="Runway API Version"
                    value={settings.runwayApiVersion}
                    placeholder="2024-11-06"
                    onChange={(v) => onChange({ runwayApiVersion: v })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-[#1a4a34]">FPT Timeout (ms)</p>
                      <input
                        type="number"
                        min={5000}
                        max={180000}
                        value={String(settings.fptAudioWaitTimeoutMs)}
                        onChange={(e) => onChange({ fptAudioWaitTimeoutMs: Number(e.target.value || "45000") })}
                        className="w-full rounded-xl border border-[#b8dfc8] bg-white px-4 py-3 text-sm text-[#1a3d2b] outline-none transition focus:border-[#10b862] focus:ring-2 focus:ring-[#10b862]/15"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-[#1a4a34]">FPT Retries</p>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={String(settings.fptTtsJobRetries)}
                        onChange={(e) => onChange({ fptTtsJobRetries: Number(e.target.value || "2") })}
                        className="w-full rounded-xl border border-[#b8dfc8] bg-white px-4 py-3 text-sm text-[#1a3d2b] outline-none transition focus:border-[#10b862] focus:ring-2 focus:ring-[#10b862]/15"
                      />
                    </div>
                  </div>
                  {storagePath && (
                    <p className="text-[11px] text-[#9bbdae]">File: {storagePath}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#daf0e5] bg-[#f3fbf7] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#b8dfc8] bg-white px-5 py-2.5 text-sm font-semibold text-[#2a6a4a] transition hover:bg-[#eaf7f0]"
          >
            Huỷ bỏ
          </button>
          <button
            type="button"
            disabled={isSaving || isLoading}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#20c06f] to-[#0cab5d] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(14,171,92,0.28)] transition hover:from-[#1bad63] hover:to-[#09a153] disabled:opacity-60"
          >
            <Settings className="size-4" />
            {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </div>
      </div>
    </div>
  );
}
