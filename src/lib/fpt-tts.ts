export type VoiceType = "Nam" | "Nữ";
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

export interface FptVoiceDiagnosticConfig {
  voice: string;
  speed: string;
  outputFormat: "mp3";
}

const FPT_TTS_URL = process.env.FPT_AI_TTS_URL || "https://api.fpt.ai/hmi/tts/v5";
const apiKey = process.env.FPT_AI_API_KEY;

export function isFptConfigured(): boolean {
  return Boolean(apiKey);
}

function getFptVoiceByType(voiceType: VoiceType): string {
  const femaleVoice = process.env.FPT_AI_VOICE_FEMALE?.trim();
  const maleVoice = process.env.FPT_AI_VOICE_MALE?.trim();

  if (voiceType === "Nữ") {
    if (!femaleVoice) {
      throw new Error(
        "FPT female voice is not configured. Please set FPT_AI_VOICE_FEMALE in .env."
      );
    }

    return femaleVoice;
  }

  if (!maleVoice) {
    throw new Error(
      "FPT male voice is not configured. Please set FPT_AI_VOICE_MALE in .env."
    );
  }

  return maleVoice;
}

function normalizeReadSpeedForFpt(readSpeed: number): string {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(readSpeed) ? readSpeed : 50));
  // Keep mapping conservative; FPT speed header is very sensitive and large values make
  // speech unnaturally fast (e.g. 10s script sounding ~5s).
  const mapped = ((clamped - 50) / 50) * 1.2;
  return mapped.toFixed(1);
}

export function buildFptVoiceDiagnosticConfig(
  settings: VoiceSettingsInput
): FptVoiceDiagnosticConfig {
  return {
    voice: getFptVoiceByType(settings.voiceType),
    speed: normalizeReadSpeedForFpt(settings.readSpeed),
    // Current FPT v5 endpoint used here returns mp3 links.
    outputFormat: "mp3",
  };
}

async function waitForAudioFromUrl(url: string): Promise<Buffer> {
  const maxAttempts = 18;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("audio") || contentType.includes("octet-stream")) {
        return Buffer.from(await response.arrayBuffer());
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  throw new Error("FPT TTS audio was not ready in time");
}

export async function generateVoiceOverWithFpt(
  input: GenerateVoiceOverInput
): Promise<Buffer> {
  if (!apiKey) {
    throw new Error("FPT_AI_API_KEY is not configured");
  }

  const voiceConfig = buildFptVoiceDiagnosticConfig(input.settings);

  const response = await fetch(FPT_TTS_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
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
    return Buffer.from(await response.arrayBuffer());
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

  return waitForAudioFromUrl(audioUrl);
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
