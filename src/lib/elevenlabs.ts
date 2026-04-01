import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export type VoiceType = "Nam" | "Nữ" | "Trung tính AI";
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

export interface ElevenLabsVoiceDiagnosticConfig {
  voiceId: string;
  speed: number;
  stability: number;
  style: number;
  outputFormat: "mp3_44100_128" | "wav_44100";
}

const apiKey = process.env.ELEVENLABS_API_KEY;

export function isElevenLabsConfigured(): boolean {
  return Boolean(apiKey);
}

function getVoiceIdByType(voiceType: VoiceType): string {
  const maleVoice = process.env.ELEVENLABS_VOICE_ID_MALE?.trim();
  const femaleVoice = process.env.ELEVENLABS_VOICE_ID_FEMALE?.trim();
  const neutralVoice = process.env.ELEVENLABS_VOICE_ID_NEUTRAL?.trim();

  if (voiceType === "Nam") {
    if (!maleVoice) {
      throw new Error(
        "Missing ELEVENLABS_VOICE_ID_MALE in .env while UI voice type is 'Nam'"
      );
    }

    return maleVoice;
  }

  if (voiceType === "Nữ") {
    if (!femaleVoice) {
      throw new Error(
        "Missing ELEVENLABS_VOICE_ID_FEMALE in .env while UI voice type is 'Nữ'"
      );
    }

    return femaleVoice;
  }

  if (!neutralVoice) {
    throw new Error(
      "Missing ELEVENLABS_VOICE_ID_NEUTRAL in .env while UI voice type is 'Trung tính AI'"
    );
  }

  return neutralVoice;
}

function normalizeReadSpeed(readSpeed: number): number {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(readSpeed) ? readSpeed : 50));
  // UI slider 0..100 -> ElevenLabs speed ~0.75..1.25
  return Number((0.75 + (clamped / 100) * 0.5).toFixed(2));
}

function normalizeEmotionIntensity(emotionIntensity: number): number {
  return Math.min(100, Math.max(0, Number.isFinite(emotionIntensity) ? emotionIntensity : 50));
}

function mapOutputFormat(outputFormat: AudioOutputFormat): "mp3_44100_128" | "wav_44100" {
  return outputFormat === "wav" ? "wav_44100" : "mp3_44100_128";
}

export function buildElevenLabsVoiceDiagnosticConfig(
  settings: VoiceSettingsInput
): ElevenLabsVoiceDiagnosticConfig {
  const voiceId = getVoiceIdByType(settings.voiceType);
  const speed = normalizeReadSpeed(settings.readSpeed);
  const emotion = normalizeEmotionIntensity(settings.emotionIntensity);

  // Higher emotion means slightly lower stability and higher style for more expressive voice.
  const stability = Number((0.7 - (emotion / 100) * 0.35).toFixed(2));
  const style = Number((0.1 + (emotion / 100) * 0.7).toFixed(2));

  return {
    voiceId,
    speed,
    stability,
    style,
    outputFormat: mapOutputFormat(settings.outputFormat),
  };
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
  const voiceConfig = buildElevenLabsVoiceDiagnosticConfig(input.settings);

  const audio = await client.textToSpeech.convert(voiceConfig.voiceId, {
    text: input.text,
    modelId: "eleven_multilingual_v2",
    outputFormat: voiceConfig.outputFormat,
    voiceSettings: {
      speed: voiceConfig.speed,
      stability: voiceConfig.stability,
      similarityBoost: 0.85,
      style: voiceConfig.style,
      useSpeakerBoost: true,
    },
  });

  return toBufferFromAudioResult(audio);
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
