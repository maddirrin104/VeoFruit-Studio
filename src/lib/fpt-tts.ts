import https from "node:https";
import http from "node:http";
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

// FPT hashes (text + voice) → deterministic CDN URL. A stale/failed job leaves that URL
// permanently 404. Appending a random visible phrase forces FPT to compute a new hash.
const CACHE_BUST_PHRASES = [
  " Cảm ơn.",
  " Xin.",
  " Vâng.",
  " Chúc.",
  " Tuyệt.",
  " Vui.",
  " Tốt.",
  " Hay.",
  " Đẹp.",
  " Tạm.",
];

export function bustFptCacheText(text: string): string {
  const phrase = CACHE_BUST_PHRASES[Math.floor(Math.random() * CACHE_BUST_PHRASES.length)];
  return text + phrase;
}

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
  // Map: 0→-0.6, 50→0.0, 100→1.2. Clamp to [-0.6, 1.2] to ensure FPT can accept it.
  const mapped = Math.max(-0.6, Math.min(1.2, ((clamped - 50) / 50) * 1.2));
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

// Use Node.js native http/https to poll FPT's async URL.
// fetch() in Electron/Next.js packaged builds can cache the first 404 response,
// causing every subsequent poll to return cached 404 even after FPT finishes.
function nativeFetch(
  url: string,
  redirectsLeft = 5
): Promise<{ status: number; buffer: Buffer }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;

    const req = lib.get(url, (res) => {
      const status = res.statusCode ?? 0;

      // Follow redirects (3xx) — https.get() does not do this automatically
      if (status >= 300 && status < 400 && res.headers.location && redirectsLeft > 0) {
        res.resume(); // drain the response
        resolve(nativeFetch(res.headers.location, redirectsLeft - 1));
        return;
      }

      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve({ status, buffer: Buffer.concat(chunks) }));
      res.on("error", reject);
    });

    req.setTimeout(12000, () => {
      req.destroy(new Error("FPT poll request timed out"));
    });
    req.on("error", reject);
  });
}

async function waitForAudioFromUrl(url: string, timeoutMs: number): Promise<Buffer> {
  const startedAt = Date.now();
  let attempt = 0;
  let lastStatus: number | undefined;

  console.info(`[fpt-tts] polling audio URL: ${url} (timeout ${timeoutMs}ms)`);

  while (Date.now() - startedAt < timeoutMs) {
    attempt += 1;

    try {
      const { status, buffer } = await nativeFetch(url);
      lastStatus = status;

      console.info(`[fpt-tts] poll attempt ${attempt}: status=${status} size=${buffer.byteLength}${status === 200 ? "" : " (not ready)"}`);

      if (status === 200) {
        if (await isBufferLikelyPlayable(buffer)) {
          console.info(`[fpt-tts] ✅ audio ready after ${attempt} attempts (${Math.round((Date.now() - startedAt) / 1000)}s)`);
          return buffer;
        }
        console.warn(`[fpt-tts] buffer not playable (too small or invalid header), continuing poll`);
      }
    } catch (fetchError) {
      console.warn(`[fpt-tts] poll attempt ${attempt} error:`, fetchError);
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
    console.error(`[fpt-tts] job request failed: status=${response.status} body=${raw}`);
    throw new Error(`FPT TTS request failed: ${response.status} ${raw}`);
  }

  const contentType = response.headers.get("content-type") || "";
  console.info(`[fpt-tts] job request sent: voice="${voiceConfig.voice}" speed="${voiceConfig.speed}" text_length=${input.text.length}`);
  console.info(`[fpt-tts] job response: status=${response.status} content-type="${contentType}"`);

  if (contentType.includes("audio")) {
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    console.info(`[fpt-tts] sync audio response: ${audioBuffer.byteLength} bytes`);
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

  console.info(`[fpt-tts] async job payload:`, JSON.stringify(payload));

  if (typeof payload.error === "number" && payload.error !== 0) {
    throw new Error(payload.message || `FPT TTS error code ${payload.error}`);
  }

  const audioUrl = payload.async || payload.url;
  if (!audioUrl) {
    throw new Error("FPT TTS response did not include audio URL");
  }

  const normalizedUrl = normalizeFptAudioUrl(audioUrl);
  console.info(`[fpt-tts] normalized audio URL: ${normalizedUrl}`);
  return normalizedUrl;
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
    : 55000;
  const ttsUrl = runtime.fptTtsUrl || "https://api.fpt.ai/hmi/tts/v5";

  let lastError: unknown;

  for (let jobAttempt = 1; jobAttempt <= maxJobAttempts; jobAttempt += 1) {
    try {
      // Append a fresh random phrase so FPT computes a new URL hash on every attempt.
      // The same text+voice always returns the same stale 404 URL once a job has failed.
      const bustInput = { ...input, text: bustFptCacheText(input.text) };
      const requested = await requestFptTtsJob(bustInput, voiceConfig, apiKey, ttsUrl);
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
