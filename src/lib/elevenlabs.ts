import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export type VoiceType = "Nam" | "Nữ" | "Trung tính AI";

export interface VoiceSettingsInput {
  voiceType: VoiceType;
  readSpeed: number;
  language: string;
}

export interface GenerateVoiceOverInput {
  text: string;
  settings: VoiceSettingsInput;
}

const apiKey = process.env.ELEVENLABS_API_KEY;

export function isElevenLabsConfigured(): boolean {
  return Boolean(apiKey);
}

function getVoiceIdByType(voiceType: VoiceType): string {
  const maleVoice = process.env.ELEVENLABS_VOICE_ID_MALE || "JBFqnCBsd6RMkjVDRZzb";
  const femaleVoice = process.env.ELEVENLABS_VOICE_ID_FEMALE || "EXAVITQu4vr4xnSDxMaL";
  const neutralVoice = process.env.ELEVENLABS_VOICE_ID_NEUTRAL || "onwK4e9ZLuTAKqWW03F9";

  if (voiceType === "Nữ") {
    return femaleVoice;
  }

  if (voiceType === "Trung tính AI") {
    return neutralVoice;
  }

  return maleVoice;
}

function normalizeReadSpeed(readSpeed: number): number {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(readSpeed) ? readSpeed : 50));
  // UI slider 0..100 -> ElevenLabs speed ~0.75..1.25
  return Number((0.75 + (clamped / 100) * 0.5).toFixed(2));
}

async function toBufferFromAudioResult(audio: unknown): Promise<Buffer> {
  if (audio instanceof Uint8Array) {
    return Buffer.from(audio);
  }

  if (audio instanceof ArrayBuffer) {
    return Buffer.from(audio);
  }

  if (audio && typeof audio === "object" && "arrayBuffer" in audio && typeof (audio as { arrayBuffer: unknown }).arrayBuffer === "function") {
    const data = await (audio as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer();
    return Buffer.from(data);
  }

  const asyncIterable = audio as AsyncIterable<Uint8Array> | undefined;
  if (asyncIterable && typeof asyncIterable[Symbol.asyncIterator] === "function") {
    const chunks: Buffer[] = [];
    for await (const chunk of asyncIterable) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  throw new Error("Unsupported ElevenLabs audio response format");
}

export async function generateVoiceOverWithElevenLabs(
  input: GenerateVoiceOverInput
): Promise<Buffer> {
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const client = new ElevenLabsClient({ apiKey });
  const voiceId = getVoiceIdByType(input.settings.voiceType);
  const speed = normalizeReadSpeed(input.settings.readSpeed);
  const audio = await client.textToSpeech.convert(voiceId, {
    text: input.text,
    modelId: "eleven_multilingual_v2",
    voiceSettings: {
      speed,
      stability: 0.45,
      similarityBoost: 0.85,
      style: 0.25,
      useSpeakerBoost: true,
    },
  });

  return toBufferFromAudioResult(audio);
}

export function buildAudioFileName(prefix = "voiceover"): string {
  const now = new Date();
  const stamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
    String(now.getUTCHours()).padStart(2, "0"),
    String(now.getUTCMinutes()).padStart(2, "0"),
    String(now.getUTCSeconds()).padStart(2, "0"),
  ].join("");

  return `${prefix}-${stamp}-${Math.random().toString(36).slice(2, 8)}.mp3`;
}
