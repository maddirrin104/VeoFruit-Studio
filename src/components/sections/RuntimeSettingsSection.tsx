"use client";

import { KeyRound } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/FormControls";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { RuntimeSettingsRecord } from "@/services/studio-api";

type RuntimeSettingsSectionProps = {
  settings: RuntimeSettingsRecord;
  storagePath?: string;
  isLoading: boolean;
  isSaving: boolean;
  onChange: (partial: Partial<RuntimeSettingsRecord>) => void;
  onSave: () => void;
};

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="relative pl-2 text-[13px] font-semibold uppercase tracking-wide text-[#2f7056] before:absolute before:left-0 before:top-1 before:h-4 before:w-0.75 before:rounded-full before:bg-[#10b862]">
      {children}
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
  return (
    <Card className="p-6 md:p-7">
      <SectionHeading title="Settings API" icon={<KeyRound className="size-5" />} />

      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Google API Key (Veo3/Gemini)</FieldLabel>
            <TextInput
              type="password"
              value={settings.googleApiKey || ""}
              placeholder="AIza..."
              onChange={(event) => onChange({ googleApiKey: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Runway API Secret</FieldLabel>
            <TextInput
              type="password"
              value={settings.runwayApiSecret || ""}
              placeholder="rw_..."
              onChange={(event) => onChange({ runwayApiSecret: event.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>FPT AI API Key</FieldLabel>
            <TextInput
              type="password"
              value={settings.fptApiKey || ""}
              placeholder="fpt_..."
              onChange={(event) => onChange({ fptApiKey: event.target.value })}
            />
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
            <FieldLabel>Kling Access Key ID</FieldLabel>
            <TextInput
              value={settings.klingAccessKeyId || ""}
              placeholder="Kling Access Key ID"
              onChange={(event) => onChange({ klingAccessKeyId: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Kling Access Key Secret</FieldLabel>
            <TextInput
              type="password"
              value={settings.klingAccessKeySecret || ""}
              placeholder="Kling Access Key Secret"
              onChange={(event) => onChange({ klingAccessKeySecret: event.target.value })}
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
