"use client";

import { useCallback, useState } from "react";
import { KeyRound } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/FormControls";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testApiKey, type ApiKeyProvider, type RuntimeSettingsRecord } from "@/services/studio-api";

type RuntimeSettingsSectionProps = {
  settings: RuntimeSettingsRecord;
  storagePath?: string;
  isLoading: boolean;
  isSaving: boolean;
  onChange: (partial: Partial<RuntimeSettingsRecord>) => void;
  onSave: () => void;
};

type TestStatus = { state: "idle" | "loading" | "ok" | "error"; message?: string };

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="relative pl-2 text-[13px] font-semibold uppercase tracking-wide text-[#2f7056] before:absolute before:left-0 before:top-1 before:h-4 before:w-0.75 before:rounded-full before:bg-[#10b862]">
      {children}
    </p>
  );
}

function TestButton({
  onClick,
  loading,
  disabled,
}: {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="text-[11px] font-semibold text-[#0db461] transition hover:text-[#09a657] disabled:cursor-not-allowed disabled:opacity-40"
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

export function RuntimeSettingsSection({
  settings,
  storagePath,
  isLoading,
  isSaving,
  onChange,
  onSave,
}: RuntimeSettingsSectionProps) {
  const [tests, setTests] = useState<Partial<Record<ApiKeyProvider, TestStatus>>>({});

  const runTest = useCallback(
    async (provider: ApiKeyProvider) => {
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
        setTests((prev) => ({
          ...prev,
          [provider]: { state: result.ok ? "ok" : "error", message: result.message },
        }));
      } catch (err) {
        setTests((prev) => ({
          ...prev,
          [provider]: { state: "error", message: (err as Error).message },
        }));
      }
    },
    [settings]
  );

  function labelRow(label: string, provider: ApiKeyProvider, hasValue: boolean) {
    return (
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <TestButton
          onClick={() => runTest(provider)}
          loading={tests[provider]?.state === "loading"}
          disabled={!hasValue}
        />
      </div>
    );
  }

  return (
    <Card className="p-6 md:p-7">
      <SectionHeading title="Settings API" icon={<KeyRound className="size-5" />} />

      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            {labelRow("Google API Key (Veo3/Gemini)", "gemini", Boolean(settings.googleApiKey))}
            <TextInput
              type="password"
              value={settings.googleApiKey || ""}
              placeholder="AIza..."
              onChange={(event) => {
                onChange({ googleApiKey: event.target.value });
                setTests((prev) => ({ ...prev, gemini: { state: "idle" } }));
              }}
            />
            <TestResult status={tests.gemini} />
          </div>
          <div className="space-y-2">
            {labelRow("Runway API Secret", "runway", Boolean(settings.runwayApiSecret))}
            <TextInput
              type="password"
              value={settings.runwayApiSecret || ""}
              placeholder="rw_..."
              onChange={(event) => {
                onChange({ runwayApiSecret: event.target.value });
                setTests((prev) => ({ ...prev, runway: { state: "idle" } }));
              }}
            />
            <TestResult status={tests.runway} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            {labelRow("FPT AI API Key", "fpt", Boolean(settings.fptApiKey))}
            <TextInput
              type="password"
              value={settings.fptApiKey || ""}
              placeholder="fpt_..."
              onChange={(event) => {
                onChange({ fptApiKey: event.target.value });
                setTests((prev) => ({ ...prev, fpt: { state: "idle" } }));
              }}
            />
            <TestResult status={tests.fpt} />
          </div>
          <div className="space-y-2">
            <FieldLabel>FPT TTS URL</FieldLabel>
            <TextInput
              value={settings.fptTtsUrl}
              placeholder="https://api.fpt.ai/hmi/tts/v5"
              onChange={(event) => onChange({ fptTtsUrl: event.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            {labelRow(
              "Kling Access Key ID",
              "kling",
              Boolean(settings.klingAccessKeyId && settings.klingAccessKeySecret)
            )}
            <TextInput
              value={settings.klingAccessKeyId || ""}
              placeholder="Kling Access Key ID"
              onChange={(event) => {
                onChange({ klingAccessKeyId: event.target.value });
                setTests((prev) => ({ ...prev, kling: { state: "idle" } }));
              }}
            />
            <TestResult status={tests.kling} />
          </div>
          <div className="space-y-2">
            <FieldLabel>Kling Access Key Secret</FieldLabel>
            <TextInput
              type="password"
              value={settings.klingAccessKeySecret || ""}
              placeholder="Kling Access Key Secret"
              onChange={(event) => {
                onChange({ klingAccessKeySecret: event.target.value });
                setTests((prev) => ({ ...prev, kling: { state: "idle" } }));
              }}
            />
            <p className="text-xs text-[#5d8e77]">
              Lay tu https://console.klingai.com — can ca Access Key ID va Secret Key.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Runway Base URL</FieldLabel>
            <TextInput
              value={settings.runwayApiBaseUrl}
              placeholder="https://api.dev.runwayml.com"
              onChange={(event) => onChange({ runwayApiBaseUrl: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Runway API Version</FieldLabel>
            <TextInput
              value={settings.runwayApiVersion}
              placeholder="2024-11-06"
              onChange={(event) => onChange({ runwayApiVersion: event.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <FieldLabel>FPT Timeout (ms)</FieldLabel>
            <TextInput
              type="number"
              min={5000}
              max={180000}
              value={String(settings.fptAudioWaitTimeoutMs)}
              onChange={(event) =>
                onChange({
                  fptAudioWaitTimeoutMs: Number(event.target.value || "45000"),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>FPT Retries</FieldLabel>
            <TextInput
              type="number"
              min={1}
              max={8}
              value={String(settings.fptTtsJobRetries)}
              onChange={(event) =>
                onChange({
                  fptTtsJobRetries: Number(event.target.value || "2"),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>PUBLIC_APP_URL</FieldLabel>
            <TextInput
              value={settings.publicAppUrl || ""}
              placeholder="https://your-public-domain"
              onChange={(event) => onChange({ publicAppUrl: event.target.value })}
            />
            <p className="text-xs text-[#5d8e77]">
              Tuy chon. Co the de trong khi chi chay desktop local tren 1 may.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#bee6d0] bg-[#f3fbf7] px-4 py-3 text-sm text-[#35644f]">
          <div className="space-y-0.5">
            <p>
              {isLoading
                ? "Đang tải settings..."
                : "Settings lưu cục bộ trên máy Windows để dùng ngay không cần build lại."}
            </p>
            {storagePath ? <p className="text-xs text-[#5d8e77]">File: {storagePath}</p> : null}
          </div>

          <button
            type="button"
            disabled={isSaving || isLoading}
            onClick={onSave}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#0db461] px-5 text-sm font-semibold text-white transition hover:bg-[#09a657] disabled:opacity-60"
          >
            {isSaving ? "Đang lưu settings..." : "Lưu Settings"}
          </button>
        </div>
      </div>
    </Card>
  );
}
