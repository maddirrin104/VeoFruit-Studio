import {
  getVoiceEnvVarName,
  getVoiceProviderCode,
  type VoiceType,
} from "@/lib/voice-options";
import { getRuntimeSettings } from "@/lib/runtime-settings";

export type { VoiceType };
export type AudioOutputFormat = "mp3" | "wav";

export interface VoiceSettingsInput {
  voiceType: VoiceType;
  readSpeed: number;
  emotionIntensity: number;
  outputFormat: AudioOutputFormat;
  language: string;
}

export interface GenerateVoiceOverInput {
  text: string;
  settings: VoiceSettingsInput;
}

export class FptAudioNotReadyError extends Error {
  readonly retryable: boolean;
  readonly lastStatus?: number;

  constructor(message: string, retryable = true, lastStatus?: number) {
    super(message);
    this.name = "FptAudioNotReadyError";
    this.retryable = retryable;
    this.lastStatus = lastStatus;
  }
}

export interface FptVoiceDiagnosticConfig {
  voice: string;
  speed: string;
  outputFormat: "mp3";
}

const MIN_AUDIO_BUFFER_BYTES = 2048;

export interface FptGenerationOverrides {
  maxWaitMs?: number;
  maxJobAttempts?: number;
}

export async function isFptConfigured(): Promise<boolean> {
  const settings = await getRuntimeSettings();
  return Boolean(settings.fptApiKey);
}

function getFptVoiceByType(voiceType: VoiceType): string {
  const specificEnvName = getVoiceEnvVarName(voiceType);
  const specificEnvValue = process.env[specificEnvName]?.trim();
  if (specificEnvValue) {
    return specificEnvValue;
  }

  return getVoiceProviderCode(voiceType);
}

function normalizeReadSpeedForFpt(readSpeed: number): string {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(readSpeed) ? readSpeed : 50));
  // Keep mapping conservative; FPT speed header is very sensitive and large values make
  // speech unnaturally fast (e.g. 10s script sounding ~5s).
  const mapped = ((clamped - 50) / 50) * 1.2;
  return mapped.toFixed(1);
}

export async function buildFptVoiceDiagnosticConfig(
  settings: VoiceSettingsInput
): Promise<FptVoiceDiagnosticConfig> {
  return {
    voice: getFptVoiceByType(settings.voiceType),
    speed: normalizeReadSpeedForFpt(settings.readSpeed),
    // Current FPT v5 endpoint used here returns mp3 links.
    outputFormat: "mp3",
  };
}

async function waitForAudioFromUrl(url: string, timeoutMs: number): Promise<Buffer> {
  const startedAt = Date.now();
  let attempt = 0;
  let lastStatus: number | undefined;

  while (Date.now() - startedAt < timeoutMs) {
    attempt += 1;

    try {
      const response = await fetch(url);
      lastStatus = response.status;

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("audio") || contentType.includes("octet-stream")) {
          const buffer = Buffer.from(await response.arrayBuffer());
          if (await isBufferLikelyPlayable(buffer)) {
            return buffer;
          }
        }
      }
    } catch {
      // Keep polling when transient network errors happen.
    }

    const delayMs = Math.min(2200, 550 + attempt * 180);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
  const statusHint = typeof lastStatus === "number" ? ` Last status: ${lastStatus}.` : "";
  throw new FptAudioNotReadyError(
    `FPT TTS audio was not ready in time after ${elapsedSeconds}s.${statusHint}`,
    true,
    lastStatus
  );
}

export function isFptAudioNotReadyError(error: unknown): error is FptAudioNotReadyError {
  return error instanceof FptAudioNotReadyError;
}

function normalizeFptAudioUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/^['"]+|['"]+$/g, "");
  const withProtocol = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("Invalid protocol");
    }

    return parsed.toString();
  } catch {
    throw new Error(`FPT TTS returned invalid audio URL: ${rawUrl}`);
  }
}

async function requestFptTtsJob(
  input: GenerateVoiceOverInput,
  voiceConfig: FptVoiceDiagnosticConfig,
  apiKey: string,
  ttsUrl: string
): Promise<Buffer | string> {
  const response = await fetch(ttsUrl, {
    method: "POST",
    headers: {
      "api-key": apiKey || "",
      speed: voiceConfig.speed,
      voice: voiceConfig.voice,
      "content-type": "text/plain; charset=utf-8",
    },
    body: input.text,
  });

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(`FPT TTS request failed: ${response.status} ${raw}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("audio")) {
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    if (await isBufferLikelyPlayable(audioBuffer)) {
      return audioBuffer;
    }

    throw new FptAudioNotReadyError(
      `FPT TTS returned audio too short (${audioBuffer.byteLength} bytes).`,
      true,
      response.status
    );
  }

  const payload = (await response.json()) as {
    async?: string;
    url?: string;
    error?: number;
    message?: string;
  };

  if (typeof payload.error === "number" && payload.error !== 0) {
    throw new Error(payload.message || `FPT TTS error code ${payload.error}`);
  }

  const audioUrl = payload.async || payload.url;
  if (!audioUrl) {
    throw new Error("FPT TTS response did not include audio URL");
  }

  return normalizeFptAudioUrl(audioUrl);
}

async function isBufferLikelyPlayable(buffer: Buffer): Promise<boolean> {
  if (buffer.byteLength < MIN_AUDIO_BUFFER_BYTES) {
    return false;
  }

  // Fast validation without ffmpeg dependency:
  // - MP3 with ID3 tag header
  // - or MPEG frame sync bytes in first chunk.
  const header = buffer.subarray(0, 3).toString("ascii");
  if (header === "ID3") {
    return true;
  }

  const inspectionLimit = Math.min(buffer.length - 1, 2048);
  for (let index = 0; index < inspectionLimit; index += 1) {
    const current = buffer[index];
    const next = buffer[index + 1];
    if (current === 0xff && (next & 0xe0) === 0xe0) {
      return true;
    }
  }

  return false;
}

export async function generateVoiceOverWithFpt(
  input: GenerateVoiceOverInput,
  overrides: FptGenerationOverrides = {}
): Promise<Buffer> {
  const runtime = await getRuntimeSettings();
  const apiKey = runtime.fptApiKey;
  if (!apiKey) {
    throw new Error("FPT_AI_API_KEY is not configured");
  }

  const voiceConfig = await buildFptVoiceDiagnosticConfig(input.settings);
  const maxJobAttempts = Number.isFinite(overrides.maxJobAttempts)
    ? Math.max(1, Number(overrides.maxJobAttempts))
    : Number.isFinite(runtime.fptTtsJobRetries)
    ? Math.max(1, runtime.fptTtsJobRetries)
    : 2;
  const timeoutMs = Number.isFinite(overrides.maxWaitMs)
    ? Math.max(8000, Number(overrides.maxWaitMs))
    : Number.isFinite(runtime.fptAudioWaitTimeoutMs)
    ? Math.max(10000, runtime.fptAudioWaitTimeoutMs)
    : 45000;
  const ttsUrl = runtime.fptTtsUrl || "https://api.fpt.ai/hmi/tts/v5";

  let lastError: unknown;

  for (let jobAttempt = 1; jobAttempt <= maxJobAttempts; jobAttempt += 1) {
    try {
      const requested = await requestFptTtsJob(input, voiceConfig, apiKey, ttsUrl);
      if (Buffer.isBuffer(requested)) {
        return requested;
      }

      return await waitForAudioFromUrl(requested, timeoutMs);
    } catch (error) {
      lastError = error;
      const shouldRetryAnotherJob =
        isFptAudioNotReadyError(error) &&
        jobAttempt < maxJobAttempts;

      if (!shouldRetryAnotherJob) {
        throw error;
      }

      // Some async URLs can stay 404 permanently; requesting a fresh TTS job is often faster.
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  throw lastError;
}

export function buildAudioFileName(
  prefix = "voiceover",
  extension: AudioOutputFormat = "mp3"
): string {
  const now = new Date();
  const stamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
    String(now.getUTCHours()).padStart(2, "0"),
    String(now.getUTCMinutes()).padStart(2, "0"),
    String(now.getUTCSeconds()).padStart(2, "0"),
  ].join("");

  return `${prefix}-${stamp}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
}
