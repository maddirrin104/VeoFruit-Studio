"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, LockOpen, Settings, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  testApiKey,
  type RuntimeSettingsRecord,
  type ApiKeyProvider,
} from "@/services/studio-api";
import type { WorkflowMode } from "@/types/studio";

// ── Token validation ────────────────────────────────────────────────────────
// 3 tokens — tất cả đều full quyền, token 2 & 3 là backup.
const VALID_TOKEN_PAYLOADS = new Set([
  "ACCESS-ALPHA::VeoFruit-Studio-2026::FullAccess::Gemini+Runway+FPT+Kling",
  "STUDIO-BETA::VeoFruit-2026::AllModels::Gemini+Runway+FPT+Kling::BackupKey",
  "MASTER-GAMMA::VeoFruit-Studio::CompleteAccess::AllFeatures::AdminBackup::2026",
]);

const STORAGE_KEY = "veofruitstudio_access_token";

function isValidToken(input: string): boolean {
  try {
    const decoded = atob(input.trim());
    return VALID_TOKEN_PAYLOADS.has(decoded);
  } catch {
    return false;
  }
}

// localStorage để token tồn tại vĩnh viễn — không cần nhập lại ở máy đã xác thực.
function saveSession(token: string): void {
  try { localStorage.setItem(STORAGE_KEY, token.trim()); } catch { /* ignore */ }
}

function hasSession(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null && isValidToken(saved);
  } catch { return false; }
}

function clearSession(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

// ── Sub-components ──────────────────────────────────────────────────────────

type RunwayModelOption = { id: string; label: string; price: string };

const RUNWAY_MODEL_OPTIONS: RunwayModelOption[] = [
  { id: "gen4_turbo", label: "Gen 4 Turbo (image to video)", price: "5 credits/s" },
  { id: "gen4.5",     label: "Gen 4.5",                      price: "12 credits/s" },
];

type ApiConfigModalProps = {
  settings: RuntimeSettingsRecord;
  isLoading: boolean;
  isSaving: boolean;
  workflowMode: WorkflowMode;
  aiModel: string;
  storagePath?: string;
  onChange: (partial: Partial<RuntimeSettingsRecord>) => void;
  onAiModelChange: (model: string) => void;
  onSave: () => void;
  onClose: () => void;
};

type TestStatus = { state: "idle" | "loading" | "ok" | "error"; message?: string };

function TestButton({ onClick, loading, disabled }: { onClick: () => void; loading: boolean; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="px-3 py-1.5 text-sm font-semibold text-white bg-[#0db461] rounded-lg transition hover:bg-[#09a657] disabled:bg-[#9bbdae] disabled:cursor-not-allowed"
    >
      {loading ? "Đang test..." : "Kiểm tra"}
    </button>
  );
}

function TestResult({ status }: { status?: TestStatus }) {
  if (!status || status.state === "idle" || status.state === "loading") return null;
  const ok = status.state === "ok";
  return (
    <p className={`text-xs font-medium ${ok ? "text-[#0db461]" : "text-red-500"}`}>
      {ok ? "✓" : "✗"} {status.message}
    </p>
  );
}

function PasswordField({
  label, value, placeholder, disabled, disabledNote, onChange, onTest, testStatus, testLoading,
}: {
  label: string; value: string; placeholder: string; disabled?: boolean; disabledNote?: string;
  onChange: (v: string) => void; onTest?: () => void; testStatus?: TestStatus; testLoading?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#1a4a34]">{label}</p>
        {onTest && <TestButton onClick={onTest} loading={testLoading || false} disabled={disabled || !value.trim()} />}
      </div>
      <div className={`flex items-center overflow-hidden rounded-xl border transition ${
        disabled ? "border-[#d8ead2] bg-[#f5fbf7] opacity-60" : "border-[#b8dfc8] bg-white focus-within:border-[#10b862] focus-within:ring-2 focus-within:ring-[#10b862]/15"
      }`}>
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
      {testStatus && <TestResult status={testStatus} />}
      {disabled && disabledNote && <p className="text-[11px] text-[#9bbdae]">{disabledNote}</p>}
    </div>
  );
}

function TextField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (v: string) => void }) {
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

// ── Main component ──────────────────────────────────────────────────────────

export function ApiConfigModal({
  settings, isLoading, isSaving, workflowMode, aiModel, storagePath,
  onChange, onAiModelChange, onSave, onClose,
}: ApiConfigModalProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tests, setTests] = useState<Partial<Record<ApiKeyProvider, TestStatus>>>({});

  const usage = API_USAGE[workflowMode];
  const modeLabel = MODE_LABELS[workflowMode];

  // Restore session if still active (within same browser/Electron window session)
  useEffect(() => {
    if (hasSession()) setUnlocked(true);
  }, []);

  const handleVerifyToken = useCallback(() => {
    const input = tokenInput.trim();
    if (!input) {
      setTokenError("Vui lòng nhập token truy cập.");
      return;
    }
    if (isValidToken(input)) {
      saveSession(input);
      setUnlocked(true);
      setTokenInput("");
      setTokenError(null);
    } else {
      setTokenError("Token không hợp lệ. Vui lòng kiểm tra lại.");
    }
  }, [tokenInput]);

  const handleLock = useCallback(() => {
    clearSession();
    setUnlocked(false);
    setTokenInput("");
    setTokenError(null);
  }, []);

  const runTest = useCallback(async (provider: ApiKeyProvider) => {
    setTests((prev) => ({ ...prev, [provider]: { state: "loading" } }));
    try {
      const result = await testApiKey({
        provider,
        googleApiKey: settings.googleApiKey,
        fptApiKey: settings.fptApiKey,
        fptTtsUrl: settings.fptTtsUrl,
        runwayApiSecret: settings.runwayApiSecret,
        runwayApiBaseUrl: settings.runwayApiBaseUrl,
        runwayApiVersion: settings.runwayApiVersion,
        klingAccessKeyId: settings.klingAccessKeyId,
        klingAccessKeySecret: settings.klingAccessKeySecret,
      });
      setTests((prev) => ({ ...prev, [provider]: { state: result.ok ? "ok" : "error", message: result.message } }));
    } catch (err) {
      setTests((prev) => ({ ...prev, [provider]: { state: "error", message: (err as Error).message } }));
    }
  }, [settings]);

  const handleSave = () => { onSave(); onClose(); };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-[#0f2a1d]/35 backdrop-blur-[2px]" />

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
          <div className="flex items-center gap-1">
            {unlocked && (
              <button
                type="button"
                onClick={handleLock}
                className="flex size-8 items-center justify-center rounded-lg text-[#5a8a72] transition hover:bg-[#ddf5ea] hover:text-[#0f6e3a]"
                title="Khoá settings"
                aria-label="Khoá settings"
              >
                <LockOpen className="size-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg text-[#5a8a72] transition hover:bg-[#ddf5ea] hover:text-[#0f6e3a]"
              aria-label="Đóng"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">

          {/* ── Locked — token input ── */}
          {!unlocked && (
            <div className="-mx-6 -mt-5">
              {/* Hero banner */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#0a4f2e] via-[#0d6b3d] to-[#0f8a50] px-8 pb-8 pt-7 text-center">
                {/* Decorative circles */}
                <div className="pointer-events-none absolute -left-8 -top-8 size-36 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -right-4 -bottom-6 size-28 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute right-10 top-2 size-14 rounded-full bg-white/5" />

                {/* Icon */}
                <div className="relative mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/15 shadow-[0_0_0_6px_rgba(255,255,255,0.08)] backdrop-blur-sm">
                  <KeyRound className="size-8 text-white drop-shadow-md" />
                </div>

                <h3 className="text-lg font-bold tracking-tight text-white">Xác thực truy cập</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/65">
                  Nhập token được cấp để mở<br />cài đặt API keys
                </p>
              </div>

              {/* Input section */}
              <div className="space-y-4 px-6 pt-6 pb-1">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#6a9f87]">
                    Access Token
                  </label>
                  <div className={`flex items-center gap-2 overflow-hidden rounded-xl border-2 bg-[#f7fdf9] px-3 transition ${
                    tokenError ? "border-red-300 focus-within:border-red-400" : "border-[#c2e8d4] focus-within:border-[#10b862] focus-within:ring-2 focus-within:ring-[#10b862]/15"
                  }`}>
                    <KeyRound className="size-4 shrink-0 text-[#8ec4a8]" />
                    <input
                      type="text"
                      value={tokenInput}
                      autoFocus
                      placeholder="Dán token vào đây..."
                      onChange={(e) => { setTokenInput(e.target.value); setTokenError(null); }}
                      onKeyDown={(e) => e.key === "Enter" && handleVerifyToken()}
                      className="flex-1 bg-transparent py-3 text-[13px] font-mono text-[#1a3d2b] outline-none placeholder:text-[#aacebb] tracking-wide"
                    />
                  </div>
                  {tokenError ? (
                    <p className="flex items-center gap-1 text-xs font-medium text-red-500">
                      <span className="inline-block size-3.5 text-center leading-none">✗</span>
                      {tokenError}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#9bbdae]">Token có dạng chuỗi ký tự dài được mã hoá</p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!tokenInput.trim()}
                  onClick={handleVerifyToken}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#10b862] to-[#0cab5d] px-5 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_4px_16px_rgba(14,171,92,0.4)] transition-all hover:shadow-[0_6px_20px_rgba(14,171,92,0.5)] hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <KeyRound className="size-4" />
                    Xác nhận
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ── Unlocked — API config ── */}
          {unlocked && (
            isLoading ? (
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
                  onChange={(v) => { onChange({ googleApiKey: v }); setTests((prev) => ({ ...prev, gemini: { state: "idle" } })); }}
                  onTest={() => runTest("gemini")}
                  testStatus={tests.gemini}
                  testLoading={tests.gemini?.state === "loading"}
                />

                <PasswordField
                  label="RunwayML API Key"
                  value={settings.runwayApiSecret || ""}
                  placeholder="rw_..."
                  disabled={!usage.runway}
                  disabledNote={`Không dùng trong ${modeLabel}`}
                  onChange={(v) => { onChange({ runwayApiSecret: v }); setTests((prev) => ({ ...prev, runway: { state: "idle" } })); }}
                  onTest={() => runTest("runway")}
                  testStatus={tests.runway}
                  testLoading={tests.runway?.state === "loading"}
                />

                {usage.runway && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-[#1a4a34]">Model Runway</p>
                    <div className="flex flex-wrap gap-2">
                      {RUNWAY_MODEL_OPTIONS.map((m) => {
                        const isActive = aiModel === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => onAiModelChange(m.id)}
                            className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all ${
                              isActive
                                ? "border-[#0db461] bg-[#dff6ea] text-[#16633f] shadow-[0_4px_10px_rgba(13,180,97,0.2)]"
                                : "border-[#c9e5d5] bg-[#f0f7f3] text-[#3f6f5a] hover:border-[#9fdab9]"
                            }`}
                          >
                            <span className="font-semibold">{m.label}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? "bg-[#b5efd2] text-[#0a6b3a]" : "bg-[#e2f0e9] text-[#4a7a5e]"}`}>
                              {m.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {aiModel === "gen4_turbo" && (
                      <p className="text-[11px] text-[#5a8a72]">Gen 4 Turbo chỉ hỗ trợ image-to-video — cần upload ảnh sản phẩm.</p>
                    )}
                  </div>
                )}

                <PasswordField
                  label="FPT AI API Key (TTS)"
                  value={settings.fptApiKey || ""}
                  placeholder="Nhập API Key từ FPT AI..."
                  onChange={(v) => { onChange({ fptApiKey: v }); setTests((prev) => ({ ...prev, fpt: { state: "idle" } })); }}
                  onTest={() => runTest("fpt")}
                  testStatus={tests.fpt}
                  testLoading={tests.fpt?.state === "loading"}
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
                    onChange={(v) => { onChange({ klingAccessKeyId: v }); setTests((prev) => ({ ...prev, kling: { state: "idle" } })); }}
                    onTest={() => runTest("kling")}
                    testStatus={tests.kling}
                    testLoading={tests.kling?.state === "loading"}
                  />

                  <PasswordField
                    label="Kling AI Secret Key"
                    value={settings.klingAccessKeySecret || ""}
                    placeholder="Nhập Secret Key từ Kling AI..."
                    disabled={!usage.kling}
                    disabledNote="Lấy tại console.klingai.com"
                    onChange={(v) => { onChange({ klingAccessKeySecret: v }); setTests((prev) => ({ ...prev, kling: { state: "idle" } })); }}
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
                    <TextField label="FPT TTS URL" value={settings.fptTtsUrl} placeholder="https://api.fpt.ai/hmi/tts/v5" onChange={(v) => onChange({ fptTtsUrl: v })} />
                    <TextField label="Runway Base URL" value={settings.runwayApiBaseUrl} placeholder="https://api.dev.runwayml.com" onChange={(v) => onChange({ runwayApiBaseUrl: v })} />
                    <TextField label="Runway API Version" value={settings.runwayApiVersion} placeholder="2024-11-06" onChange={(v) => onChange({ runwayApiVersion: v })} />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-[#1a4a34]">FPT Timeout (ms)</p>
                        <input
                          type="number" min={5000} max={180000} value={String(settings.fptAudioWaitTimeoutMs)}
                          onChange={(e) => onChange({ fptAudioWaitTimeoutMs: Number(e.target.value || "45000") })}
                          className="w-full rounded-xl border border-[#b8dfc8] bg-white px-4 py-3 text-sm text-[#1a3d2b] outline-none transition focus:border-[#10b862] focus:ring-2 focus:ring-[#10b862]/15"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-[#1a4a34]">FPT Retries</p>
                        <input
                          type="number" min={1} max={8} value={String(settings.fptTtsJobRetries)}
                          onChange={(e) => onChange({ fptTtsJobRetries: Number(e.target.value || "2") })}
                          className="w-full rounded-xl border border-[#b8dfc8] bg-white px-4 py-3 text-sm text-[#1a3d2b] outline-none transition focus:border-[#10b862] focus:ring-2 focus:ring-[#10b862]/15"
                        />
                      </div>
                    </div>
                    {storagePath && <p className="text-[11px] text-[#9bbdae]">File: {storagePath}</p>}
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#daf0e5] bg-[#f3fbf7] px-6 py-4">
          {unlocked ? (
            <>
              <button type="button" onClick={onClose} className="rounded-xl border border-[#b8dfc8] bg-white px-5 py-2.5 text-sm font-semibold text-[#2a6a4a] transition hover:bg-[#eaf7f0]">
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
            </>
          ) : (
            <button type="button" onClick={onClose} className="rounded-xl border border-[#b8dfc8] bg-white px-5 py-2.5 text-sm font-semibold text-[#2a6a4a] transition hover:bg-[#eaf7f0]">
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
