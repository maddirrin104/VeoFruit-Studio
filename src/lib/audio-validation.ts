import {
  getAudioDurationSecondsFromBuffer,
  transcodeAudioBufferToMp3,
} from "@/lib/audio-postprocess";

const MIN_PLAYABLE_AUDIO_BYTES = 2048;
const MIN_PLAYABLE_AUDIO_SECONDS = 0.6;

function isDurationPlayable(durationSeconds?: number): boolean {
  return (
    typeof durationSeconds === "number" &&
    Number.isFinite(durationSeconds) &&
    durationSeconds >= MIN_PLAYABLE_AUDIO_SECONDS
  );
}

export type PlayableAudioResult = {
  buffer: Buffer;
  durationSeconds?: number;
  normalized: boolean;
};

export async function ensurePlayableMp3Buffer(
  rawBuffer: Buffer,
  contextLabel: string
): Promise<PlayableAudioResult> {
  if (rawBuffer.byteLength < MIN_PLAYABLE_AUDIO_BYTES) {
    throw new Error(
      `${contextLabel} audio is too short (${rawBuffer.byteLength} bytes).`
    );
  }

  const directDuration = await getAudioDurationSecondsFromBuffer(rawBuffer, "mp3");
  if (isDurationPlayable(directDuration)) {
    return {
      buffer: rawBuffer,
      durationSeconds: directDuration,
      normalized: false,
    };
  }

  const transcoded = await transcodeAudioBufferToMp3(rawBuffer, "mp3");
  if (
    transcoded.buffer.byteLength >= MIN_PLAYABLE_AUDIO_BYTES &&
    isDurationPlayable(transcoded.durationSeconds)
  ) {
    return {
      buffer: transcoded.buffer,
      durationSeconds: transcoded.durationSeconds,
      normalized: true,
    };
  }

  throw new Error(
    `${contextLabel} audio is invalid or near-silent (duration ${
      typeof transcoded.durationSeconds === "number"
        ? `${transcoded.durationSeconds.toFixed(2)}s`
        : "unknown"
    }).`
  );
}